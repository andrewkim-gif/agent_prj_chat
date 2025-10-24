// Language code to display name mapping
export const LANGUAGE_MAP: Record<string, string> = {
  // Asian Languages
  'ko': '한국어',
  'ja': '일본어',
  'zh': '중국어',
  'vi': '베트남어',
  'th': '태국어',
  'id': '인도네시아어',
  'ms': '말레이어',
  'tl': '타갈로그어',
  'fil': '필리핀어',
  'my': '미얀마어',
  'km': '크메르어',
  'lo': '라오어',

  // Middle Eastern Languages
  'ar': '아랍어',
  'fa': '페르시아어',
  'ur': '우르두어',
  'he': '히브리어',
  'tr': '터키어',

  // European Languages
  'en': '영어',
  'es': '스페인어',
  'fr': '프랑스어',
  'de': '독일어',
  'it': '이탈리아어',
  'pt': '포르투갈어',
  'ru': '러시아어',
  'pl': '폴란드어',
  'nl': '네덜란드어',
  'sv': '스웨덴어',
  'no': '노르웨이어',
  'da': '덴마크어',
  'fi': '핀란드어',
  'cs': '체코어',
  'sk': '슬로바키아어',
  'hu': '헝가리어',
  'ro': '루마니아어',
  'bg': '불가리아어',
  'hr': '크로아티아어',
  'sr': '세르비아어',
  'sl': '슬로베니아어',
  'et': '에스토니아어',
  'lv': '라트비아어',
  'lt': '리투아니아어',
  'mt': '몰타어',
  'is': '아이슬란드어',
  'ga': '아일랜드어',
  'cy': '웨일스어',
  'eu': '바스크어',
  'ca': '카탈루냐어',
  'gl': '갈리시아어',

  // African Languages
  'sw': '스와힐리어',
  'am': '암하라어',
  'yo': '요루바어',
  'ig': '이그보어',
  'ha': '하우사어',
  'zu': '줄루어',
  'xh': '코사어',
  'af': '아프리칸스어',

  // Indian Subcontinent Languages
  'hi': '힌디어',
  'bn': '벵골어',
  'te': '텔루구어',
  'mr': '마라티어',
  'ta': '타밀어',
  'gu': '구자라트어',
  'kn': '칸나다어',
  'ml': '말라얄람어',
  'or': '오리야어',
  'pa': '펀자브어',
  'as': '아삼어',
  'ne': '네팔어',
  'si': '싱할라어',
  'dv': '디베히어',

  // Other Languages
  'mn': '몽골어',
  'ka': '조지아어',
  'hy': '아르메니아어',
  'az': '아제르바이잔어',
  'kk': '카자흐어',
  'ky': '키르기스어',
  'uz': '우즈베크어',
  'tk': '투르크멘어',
  'tg': '타지크어',

  // Special cases
  'etc': '자막없음',
  'unknown': '알 수 없음',
  'mixed': '다국어',
  'null': '자막없음',
  'undefined': '자막없음',
  '': '자막없음'
};

/**
 * Convert language code to display name
 * @param langCode - Language code (e.g., 'ko', 'en', 'tr')
 * @returns Display name (e.g., '한국어', '영어', '터키어')
 */
export function getLanguageDisplayName(langCode: string | null | undefined): string {
  if (!langCode || langCode === 'null' || langCode === 'undefined') {
    return '자막없음';
  }

  // Convert to lowercase for consistent lookup
  const normalizedCode = langCode.toLowerCase().trim();

  // Special case for vietnam/vietnamese
  if (normalizedCode === 'vietnam' || normalizedCode === 'vietnamese') {
    return '베트남어';
  }

  return LANGUAGE_MAP[normalizedCode] || `${langCode} (미분류)`;
}

/**
 * Get all available languages with their display names
 * @returns Array of {code, name} objects
 */
export function getAllLanguages(): Array<{code: string, name: string}> {
  return Object.entries(LANGUAGE_MAP).map(([code, name]) => ({
    code,
    name
  }));
}

/**
 * Filter languages by search term
 * @param searchTerm - Search term to filter by
 * @returns Filtered array of {code, name} objects
 */
export function searchLanguages(searchTerm: string): Array<{code: string, name: string}> {
  const term = searchTerm.toLowerCase();
  return getAllLanguages().filter(lang =>
    lang.name.includes(term) ||
    lang.code.toLowerCase().includes(term)
  );
}

/**
 * Sort languages by usage frequency (most common first)
 * Common languages in content analysis context
 */
export const COMMON_LANGUAGES = [
  'ko', 'en', 'ja', 'zh', 'fil', 'vi', 'th', 'id', 'ar', 'fa', 'tr', 'etc'
];

/**
 * Get languages sorted by priority (common languages first)
 * @returns Array of {code, name} objects sorted by usage priority
 */
export function getLanguagesByPriority(): Array<{code: string, name: string}> {
  const common = COMMON_LANGUAGES.map(code => ({
    code,
    name: getLanguageDisplayName(code)
  }));

  const others = getAllLanguages()
    .filter(lang => !COMMON_LANGUAGES.includes(lang.code))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  return [...common, ...others];
}