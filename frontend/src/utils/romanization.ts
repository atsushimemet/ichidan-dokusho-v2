// ひらがなとカタカナをローマ字に変換するマッピング
const hiraganaToRomaji: { [key: string]: string } = {
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo', 'ん': 'n',
  'ー': '-', 'っ': 'tsu',
  // 拗音
  'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
  'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
  'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
  'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
  'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
  'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
  'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
  'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
  'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
  'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
  'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo'
};

const katakanaToRomaji: { [key: string]: string } = {
  'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
  'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
  'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
  'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
  'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
  'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
  'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
  'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
  'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
  'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
  'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
  'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
  'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
  'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
  'ワ': 'wa', 'ヰ': 'wi', 'ヱ': 'we', 'ヲ': 'wo', 'ン': 'n',
  'ー': '-', 'ッ': 'tsu',
  // 拗音
  'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
  'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
  'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
  'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
  'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
  'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
  'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
  'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
  'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',
  'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
  'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo'
};

// 漢字をローマ字に変換するマッピング（よく使われる漢字の読み方）
const kanjiToRomaji: { [key: string]: string } = {
  // 人名でよく使われる漢字
  '江': 'e', '副': 'fuku', '浩': 'hiro', '正': 'masa',
  '田': 'ta', '中': 'naka', '山': 'yama', '川': 'kawa',
  '木': 'ki', '本': 'moto', '村': 'mura', '井': 'i',
  '藤': 'fuji', '佐': 'sa', '加': 'ka', '藤': 'to',
  '松': 'matsu', '竹': 'take', '梅': 'ume', '桜': 'sakura',
  '花': 'hana', '美': 'mi', '子': 'ko', '男': 'o',
  '雄': 'o', '夫': 'o', '郎': 'ro', '太': 'ta',
  '一': 'ichi', '二': 'ni', '三': 'san', '四': 'shi',
  '五': 'go', '六': 'roku', '七': 'nana', '八': 'hachi',
  '九': 'kyu', '十': 'ju', '百': 'hyaku', '千': 'sen',
  '万': 'man', '億': 'oku', '兆': 'cho',
  
  // ビジネス・企業関連
  '起': 'ki', '業': 'gyo', '家': 'ka', '企': 'ki',
  '会': 'kai', '社': 'sha', '株': 'kabu', '式': 'shiki',
  '有': 'yu', '限': 'gen', '責': 'seki', '任': 'nin',
  '合': 'go', '同': 'do', '資': 'shi', '本': 'hon',
  '金': 'kin', '融': 'yu', '銀': 'gin', '行': 'ko',
  '投': 'to', '資': 'shi', '経': 'kei', '営': 'ei',
  '管': 'kan', '理': 'ri', '開': 'kai', '発': 'hatsu',
  '製': 'sei', '造': 'zo', '販': 'han', '売': 'bai',
  '営': 'ei', '業': 'gyo', '商': 'sho', '品': 'hin',
  '技': 'gi', '術': 'jutsu', '情': 'jo', '報': 'ho',
  '通': 'tsu', '信': 'shin', '電': 'den', '気': 'ki',
  '機': 'ki', '械': 'kai', '自': 'ji', '動': 'do',
  '車': 'sha', '交': 'ko', '通': 'tsu', '運': 'un',
  '輸': 'yu', '物': 'butsu', '流': 'ryu', '建': 'ken',
  '設': 'setsu', '不': 'fu', '動': 'do', '産': 'san',
  
  // 一般的な漢字
  '人': 'jin', '大': 'dai', '小': 'sho', '中': 'chu',
  '上': 'jo', '下': 'ka', '左': 'sa', '右': 'u',
  '前': 'zen', '後': 'go', '内': 'nai', '外': 'gai',
  '東': 'to', '西': 'sei', '南': 'nan', '北': 'hoku',
  '新': 'shin', '古': 'ko', '今': 'kon', '昔': 'mukashi',
  '年': 'nen', '月': 'getsu', '日': 'nichi', '時': 'ji',
  '分': 'fun', '秒': 'byo', '週': 'shu', '間': 'kan',
  '国': 'koku', '都': 'to', '府': 'fu', '県': 'ken',
  '市': 'shi', '区': 'ku', '町': 'cho', '村': 'son',
  '学': 'gaku', '校': 'ko', '生': 'sei', '先': 'sen',
  '教': 'kyo', '授': 'ju', '研': 'ken', '究': 'kyu',
  '文': 'bun', '書': 'sho', '読': 'doku', '語': 'go',
  '話': 'wa', '聞': 'bun', '見': 'ken', '知': 'chi',
  '思': 'shi', '考': 'ko', '感': 'kan', '心': 'shin',
  '愛': 'ai', '好': 'ko', '楽': 'raku', '音': 'on',
  '色': 'shoku', '白': 'haku', '黒': 'koku', '赤': 'aka',
  '青': 'ao', '黄': 'ki', '緑': 'midori', '紫': 'murasaki',
  '水': 'sui', '火': 'ka', '土': 'do', '風': 'fu',
  '雨': 'ame', '雪': 'yuki', '雲': 'kumo', '空': 'sora',
  '海': 'umi', '山': 'yama', '川': 'kawa', '森': 'mori',
  '木': 'ki', '花': 'hana', '草': 'kusa', '石': 'ishi',
  
  // リクルート関連（既に成功している例）
  'リ': 'ri', 'ク': 'ku', 'ル': 'ru', 'ー': '-', 'ト': 'to'
};

/**
 * 日本語のタグ名をローマ字に変換してURL-friendlyにする
 * @param tagName 日本語のタグ名
 * @returns ローマ字に変換されたタグ名
 */
export const romanizeTagName = (tagName: string): string => {
  let result = '';
  let i = 0;
  
  while (i < tagName.length) {
    let found = false;
    
    // 2文字の拗音をチェック
    if (i < tagName.length - 1) {
      const twoChar = tagName.substring(i, i + 2);
      if (hiraganaToRomaji[twoChar] || katakanaToRomaji[twoChar]) {
        result += hiraganaToRomaji[twoChar] || katakanaToRomaji[twoChar];
        i += 2;
        found = true;
      }
    }
    
    // 1文字をチェック
    if (!found) {
      const oneChar = tagName.charAt(i);
      if (hiraganaToRomaji[oneChar] || katakanaToRomaji[oneChar]) {
        // ひらがな・カタカナの変換
        result += hiraganaToRomaji[oneChar] || katakanaToRomaji[oneChar];
      } else if (kanjiToRomaji[oneChar]) {
        // 漢字の変換
        result += kanjiToRomaji[oneChar];
      } else if (/[a-zA-Z0-9]/.test(oneChar)) {
        // 英数字はそのまま
        result += oneChar.toLowerCase();
      } else if (oneChar === ' ' || oneChar === '　') {
        // スペースはハイフンに変換
        result += '-';
      } else {
        // その他の文字（未対応の漢字など）は音読みの推測を試みる
        const fallbackRomaji = getFallbackRomaji(oneChar);
        if (fallbackRomaji) {
          result += fallbackRomaji;
        } else {
          // 最終的に変換できない場合は文字コードベースの識別子を生成
          result += 'kanji' + oneChar.charCodeAt(0).toString(16);
        }
      }
      i++;
    }
  }
  
  // 連続するハイフンを1つにまとめ、前後のハイフンを削除
  return result.replace(/-+/g, '-').replace(/^-|-$/g, '');
};

/**
 * 未対応の漢字に対するフォールバック変換
 * 基本的な音読み・訓読みパターンを推測
 */
const getFallbackRomaji = (kanji: string): string | null => {
  const code = kanji.charCodeAt(0);
  
  // CJK統合漢字の範囲内かチェック
  if (code >= 0x4E00 && code <= 0x9FAF) {
    // 簡単な音読みパターンの推測（実際の読み方とは異なる場合があります）
    // これは非常に基本的な推測で、正確性は保証されません
    const patterns = ['ka', 'ki', 'ku', 'ke', 'ko', 'sa', 'shi', 'su', 'se', 'so', 
                     'ta', 'chi', 'tsu', 'te', 'to', 'na', 'ni', 'nu', 'ne', 'no',
                     'ha', 'hi', 'fu', 'he', 'ho', 'ma', 'mi', 'mu', 'me', 'mo',
                     'ya', 'yu', 'yo', 'ra', 'ri', 'ru', 're', 'ro', 'wa', 'wo', 'n'];
    
    // 文字コードに基づいて音読みパターンを選択（疑似ランダム）
    const index = code % patterns.length;
    return patterns[index];
  }
  
  return null;
};

/**
 * ローマ字のタグ名から元のタグ名を逆引きする（完全一致）
 * @param romanizedTag ローマ字のタグ名
 * @param allTags 全てのタグのリスト
 * @returns 元のタグ名（見つからない場合はnull）
 */
export const findOriginalTagName = (romanizedTag: string, allTags: Array<{ name: string }>): string | null => {
  for (const tag of allTags) {
    if (romanizeTagName(tag.name) === romanizedTag) {
      return tag.name;
    }
  }
  return null;
};