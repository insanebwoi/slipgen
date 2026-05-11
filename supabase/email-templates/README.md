# Supabase Auth Email Templates — SlipGen brand

These files are the **canonical source** for the auth email templates used by
the SlipGen Supabase project. Supabase does NOT read these files automatically
— they're stored here for version control and review only.

## To deploy a template change

1. Open Supabase dashboard → your project → **Authentication → Email Templates**
2. Pick the template (Confirm signup / Magic Link / Reset Password / etc.)
3. Replace the **Subject** with the line at the top of the matching `.html` file
4. Replace the **Body** with the rest of the file
5. Save

## To improve deliverability (do this once)

1. **Project Settings → Auth → SMTP Settings** → Enable Custom SMTP
2. Use Resend / SendGrid / Postmark with sender `noreply@slipgen.in`
3. Add SPF + DKIM + DMARC DNS records (provider gives the exact values)

Without custom SMTP, Supabase rate-limits at 3 emails/hour and Gmail will
filter most of them as promotional / spam.

## Supabase template variables

Available in any template body:

| Variable                  | What it expands to                                  |
| ------------------------- | --------------------------------------------------- |
| `{{ .ConfirmationURL }}`  | One-tap confirm / reset link                        |
| `{{ .Token }}`            | 6-digit OTP code (if you prefer codes over links)   |
| `{{ .TokenHash }}`        | Hashed token for custom URL building                |
| `{{ .SiteURL }}`          | Whatever you set in Project Settings → Site URL    |
| `{{ .Email }}`            | Recipient's email                                   |
| `{{ .Data }}`             | The `options.data` payload from signUp / inviteUser |
| `{{ .RedirectTo }}`       | The redirect URL passed at request time             |
