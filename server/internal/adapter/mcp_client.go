package adapter

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"
)

// MCPTool is a tool definition as returned by tools/list.
type MCPTool struct {
	Name        string          `json:"name"`
	Description string          `json:"description"`
	InputSchema json.RawMessage `json:"inputSchema"`
}

// ToAdapterTool converts an MCPTool to the adapter Tool format understood by AI models.
func (t MCPTool) ToAdapterTool() Tool {
	return Tool{
		Type: "function",
		Function: ToolFunction{
			Name:        t.Name,
			Description: t.Description,
			Parameters:  t.InputSchema,
		},
	}
}

// MCPClient talks to an MCP server over the Streamable HTTP transport (JSON-RPC 2.0).
type MCPClient struct {
	URL        string
	AuthHeader string
	client     *http.Client
}

func NewMCPClient(url, authHeader string) *MCPClient {
	return &MCPClient{
		URL:        url,
		AuthHeader: authHeader,
		client:     &http.Client{Timeout: 30 * time.Second},
	}
}

type mcpRPCRequest struct {
	JSONRPC string      `json:"jsonrpc"`
	ID      int         `json:"id"`
	Method  string      `json:"method"`
	Params  interface{} `json:"params,omitempty"`
}

type mcpRPCResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      int             `json:"id"`
	Result  json.RawMessage `json:"result"`
	Error   *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

func (c *MCPClient) call(ctx context.Context, method string, params interface{}) (json.RawMessage, error) {
	reqBody, _ := json.Marshal(mcpRPCRequest{JSONRPC: "2.0", ID: 1, Method: method, Params: params})
	httpReq, err := http.NewRequestWithContext(ctx, "POST", c.URL, bytes.NewReader(reqBody))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")
	if c.AuthHeader != "" {
		httpReq.Header.Set("Authorization", c.AuthHeader)
	}

	resp, err := c.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("MCP request failed: %w", err)
	}
	defer resp.Body.Close()

	var rpcResp mcpRPCResponse
	if err := json.NewDecoder(resp.Body).Decode(&rpcResp); err != nil {
		return nil, fmt.Errorf("MCP response decode error: %w", err)
	}
	if rpcResp.Error != nil {
		return nil, fmt.Errorf("MCP error %d: %s", rpcResp.Error.Code, rpcResp.Error.Message)
	}
	return rpcResp.Result, nil
}

// Initialize performs the MCP protocol handshake required before any other method.
// Some servers require this; for servers that don't, the error is ignored.
func (c *MCPClient) Initialize(ctx context.Context) error {
	_, err := c.call(ctx, "initialize", map[string]interface{}{
		"protocolVersion": "2024-11-05",
		"capabilities":    map[string]interface{}{},
		"clientInfo": map[string]interface{}{
			"name":    "ModelHub",
			"version": "1.0.0",
		},
	})
	if err != nil {
		log.Printf("[MCP] initialize %q: %v (non-fatal, proceeding)", c.URL, err)
	}
	return nil // treat init failure as non-fatal
}

// ListTools fetches available tools from the MCP server.
func (c *MCPClient) ListTools(ctx context.Context) ([]MCPTool, error) {
	result, err := c.call(ctx, "tools/list", nil)
	if err != nil {
		return nil, err
	}
	var resp struct {
		Tools []MCPTool `json:"tools"`
	}
	if err := json.Unmarshal(result, &resp); err != nil {
		return nil, err
	}
	return resp.Tools, nil
}

// CallTool executes a tool on the MCP server and returns the text result.
func (c *MCPClient) CallTool(ctx context.Context, name string, arguments map[string]interface{}) (string, error) {
	result, err := c.call(ctx, "tools/call", map[string]interface{}{
		"name":      name,
		"arguments": arguments,
	})
	if err != nil {
		return "", err
	}

	// Standard MCP tools/call response: { content: [{type, text}], isError? }
	var resp struct {
		Content []struct {
			Type string `json:"type"`
			Text string `json:"text"`
		} `json:"content"`
		IsError bool `json:"isError"`
	}
	if err := json.Unmarshal(result, &resp); err != nil {
		// Fallback: treat raw result as plain text
		return strings.TrimSpace(string(result)), nil
	}
	if resp.IsError && len(resp.Content) > 0 {
		return "", fmt.Errorf("tool %s error: %s", name, resp.Content[0].Text)
	}
	var parts []string
	for _, c := range resp.Content {
		if c.Type == "text" && c.Text != "" {
			parts = append(parts, c.Text)
		}
	}
	return strings.Join(parts, "\n"), nil
}
