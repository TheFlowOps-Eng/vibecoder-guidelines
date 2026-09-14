export const rule = 19
export const title = '.env.example documents NEXT_PUBLIC_FLOWOPS_API_URL'

export function check(ctx, report) {
  // Unset means a silent fall back to the staging backend.
  if (!ctx.exists(ctx.envExamplePath)) {
    report('warn', 'no .env.example documenting NEXT_PUBLIC_FLOWOPS_API_URL', null, null)
  } else if (!ctx.read(ctx.envExamplePath).includes('NEXT_PUBLIC_FLOWOPS_API_URL')) {
    report('warn', '.env.example does not mention NEXT_PUBLIC_FLOWOPS_API_URL', null, null)
  }
}
