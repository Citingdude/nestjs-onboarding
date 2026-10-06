# ChatGPT plugin publication

The API exposes an authenticated MCP endpoint at `POST /api/v1/mcp`. Treat the
tool metadata returned by that endpoint as the review contract: ChatGPT imports a
snapshot of names, descriptions, schemas, annotations, and server instructions
when **Scan Tools** runs.

## Prepare the product

1. Replace the placeholder server name, version, instructions, and optional icon
   in the MCP module with product-specific values.
2. Curate a small user-goal-oriented tool surface with `@McpTool`. Do not mirror
   the REST API wholesale. Verify stable names, complete input and output schemas,
   permissions, privacy exposure, idempotency, destructive behavior, and external
   effects for every tool.
3. Configure OAuth 2.1 for the MCP resource. Confirm authorization-server
   discovery, PKCE S256, the exact resource audience, required scopes, and the
   `WWW-Authenticate` response for missing or invalid credentials.
4. Set `OPENAI_APPS_CHALLENGE_TOKEN` from the value supplied during verification.
   Keep it in deployment secrets; never commit a production token.
5. Ensure production ingress routes all three root-level discovery paths to the
   API:
   - `/.well-known/openai-apps-challenge`
   - `/.well-known/oauth-protected-resource`
   - `/.well-known/oauth-protected-resource/api/v1/mcp`

## Review readiness

- Provide a dedicated reviewer account that does not require MFA or other
  out-of-band interaction.
- Exercise every tool with a positive case and meaningful failure cases such as
  missing permissions, invalid identifiers, invalid input, and unavailable data.
- Audit whether tool arguments or results contain personal or sensitive data and
  ensure the published privacy policy accurately describes that processing.
- Confirm destructive and open-world annotations match runtime behavior.
- Check that errors are useful but do not expose stack traces, infrastructure
  details, credentials, or internal-only data.
- Maintain product-specific submission copy and test cases from the metadata
  actually scanned from production. The template intentionally contains no
  placeholder submission JSON.

## Publish and update

Deploy first, connect the production MCP endpoint, run **Scan Tools**, and inspect
the imported snapshot before submitting it for review. After approval, publish
that reviewed version.

Tool metadata, schemas, annotations, server instructions, and imported skills are
versioned snapshots. Changes do not update an already published plugin
automatically: deploy them, create or update a draft, scan again, verify the
snapshot, submit it for review, and publish the newly approved version. Keep the
currently approved version live until its replacement is ready.

The installed MCP SDK does not expose OpenAI-specific per-tool
`securitySchemes` in its typed `Tool` contract. Reassess that extension during
a future SDK or plugin-version upgrade instead of adding untyped metadata here.

## References

- [Define tools](https://developers.openai.com/plugins/plan/tools)
- [Authenticate users](https://developers.openai.com/plugins/build/auth)
- [MCP server review requirements](https://developers.openai.com/plugins/deploy/app-review)
