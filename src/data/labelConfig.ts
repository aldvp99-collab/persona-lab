import type { Lang } from '../i18n/strings';
import type { AttrType } from '../types';

export const AGE_LABEL: Record<Lang, Record<string, string>> = {
  ko: { '10s': '10대', '20s': '20대', '30s': '30대', '40s': '40대', '50s': '50대', '60s': '60대', '70s': '70대', '80s': '80세 이상' },
  ja: { '10s': '10代', '20s': '20代', '30s': '30代', '40s': '40代', '50s': '50代', '60s': '60代', '70s': '70代', '80s': '80歳以上' },
};

export const JOB_LABEL: Record<Lang, Record<string, string>> = {
  ko: { office: '사무직', professional: '전문직', self_employed: '자영업', student: '학생', homemaker: '주부', service: '서비스직', other: '기타' },
  ja: { office: '事務職', professional: '専門職', self_employed: '自営業', student: '学生', homemaker: '主婦・主夫', service: 'サービス業', other: 'その他' },
};

export const INCOME_LABEL: Record<Lang, Record<string, string>> = {
  ko: { low: '200만엔 미만', mid_low: '200~400만엔', mid: '400~600만엔', mid_high: '600~800만엔', high: '800만엔 이상' },
  ja: { low: '200万円未満', mid_low: '200〜400万円', mid: '400〜600万円', mid_high: '600〜800万円', high: '800万円以上' },
};

export const REGION_LABEL: Record<Lang, Record<string, string>> = {
  ko: { hokkaido: '홋카이도', tohoku: '도호쿠', kanto: '간토', chubu: '주부', kinki: '긴키', chugoku_shikoku: '주고쿠·시코쿠', kyushu: '규슈', okinawa: '오키나와' },
  ja: { hokkaido: '北海道', tohoku: '東北', kanto: '関東', chubu: '中部', kinki: '近畿', chugoku_shikoku: '中国・四国', kyushu: '九州', okinawa: '沖縄' },
};

export const GENDER_LABEL: Record<Lang, Record<string, string>> = {
  ko: { male: '남성', female: '여성' },
  ja: { male: '男性', female: '女性' },
};

// 여러 파일에서 반복되는 { age: AGE_LABEL[lang], job: JOB_LABEL[lang], income: INCOME_LABEL[lang] } 패턴을 통합
export function attrLabelMaps(lang: Lang): Record<AttrType, Record<string, string>> {
  return { age: AGE_LABEL[lang], job: JOB_LABEL[lang], income: INCOME_LABEL[lang] };
}
