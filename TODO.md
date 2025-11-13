# TODO: Fix HOD Registration Response Handling

## Information Gathered
- Backend HOD registration creates `HODRegistrationRequest` and returns success message without `access_token`
- Frontend `authService.register` expects `access_token` and `user` in response, causing "Invalid response structure" error
- `AuthContext.register` assumes standard registration flow with tokens
- Validation error shows all HOD fields missing, but frontend has checks

## Plan
- Modify `authService.ts` to return full response data instead of expecting specific structure
- Update `AuthContext.tsx` to handle HOD registration responses differently (no auth tokens)
- Ensure HOD registration shows success message and redirects appropriately
- Test the registration flow

## Dependent Files to be Edited
- `Frontend/src/api/authService.ts`
- `Frontend/src/context/AuthContext.tsx`

## Followup Steps
- Test HOD registration with valid data
- Verify error handling for missing fields
- Ensure regular user registration still works
