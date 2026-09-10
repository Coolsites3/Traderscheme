export function derivOAuthURL(): string {
  const appId = process.env.NEXT_PUBLIC_DERIV_APP_ID || '1089';
  const affiliateToken = process.env.NEXT_PUBLIC_DERIV_AFFILIATE_TOKEN;
  const utmCampaign = process.env.NEXT_PUBLIC_DERIV_UTM_CAMPAIGN;
  const oauthBase = process.env.NEXT_PUBLIC_DERIV_OAUTH_URL || 'https://oauth.deriv.com/oauth2/authorize';

  const url = new URL(oauthBase);
  url.searchParams.set('app_id', appId);
  if (affiliateToken) url.searchParams.set('affiliate_token', affiliateToken);
  if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign);
  return url.toString();
}
