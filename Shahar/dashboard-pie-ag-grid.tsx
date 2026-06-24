// findings
The GET /instructions/dashboard/counts endpoint needs to support an optional instructionSource query parameter. When provided, it should return status counts scoped only to instructions matching that source code.
Example request: GET /instructions/dashboard/counts?instructionSource=SOURCE_BILLING
Expected response: { "ADMIN_MAKER": 4, "COMPLETE": 2 } — only statuses that exist for Billing instructions, with real counts.
Currently the endpoint ignores instructionSource and returns global counts across all sources.