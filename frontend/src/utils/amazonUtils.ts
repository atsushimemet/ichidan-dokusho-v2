/**
 * URLがAmazonリンクかどうかを判定する
 * @param url 判定対象のURL
 * @returns Amazonリンクの場合true、そうでなければfalse
 */
export const isAmazonLink = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Amazonのドメインをチェック
    return hostname.includes('amazon.co.jp') || 
           hostname.includes('amazon.com') || 
           hostname.includes('amazon.co.uk') ||
           hostname.includes('amazon.de') ||
           hostname.includes('amazon.fr') ||
           hostname.includes('amazon.it') ||
           hostname.includes('amazon.es') ||
           hostname.includes('amazon.ca') ||
           hostname.includes('amazon.com.au') ||
           hostname === 'amzn.to'; // Amazonの短縮URL
  } catch (error) {
    // URLの形式が不正な場合はfalseを返す
    return false;
  }
}; 
