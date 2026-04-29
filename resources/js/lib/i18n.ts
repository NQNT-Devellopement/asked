import { usePage } from '@inertiajs/react';
import type { LocaleCode, Translations } from '@/types/global';

export type TranslateParams = Record<string, string | number>;

/**
 * Look up a translation key against the supplied dictionary. Falls back to
 * the key itself when nothing matches — Laravel-style. Supports `:placeholder`
 * interpolation so we can write `t('greeting', { name: 'Tim' })` against a
 * `Hello :name` source string.
 */
export function translate(
    dict: Translations,
    key: string,
    params?: TranslateParams,
): string {
    const raw = dict[key] ?? key;

    if (!params) {
        return raw;
    }

    return Object.entries(params).reduce(
        (acc, [placeholder, value]) =>
            acc.replaceAll(`:${placeholder}`, String(value)),
        raw,
    );
}

export type UseTranslate = {
    locale: LocaleCode;
    t: (key: string, params?: TranslateParams) => string;
};

/**
 * React hook returning the current locale and a `t()` function bound to the
 * dictionary shared via Inertia. Re-reads on every page visit because the
 * shared props are returned fresh after a locale switch.
 */
export function useTranslate(): UseTranslate {
    const { props } = usePage();
    const dict = (props.translations as Translations | undefined) ?? {};
    const locale = (props.locale as LocaleCode | undefined) ?? 'en';

    return {
        locale,
        t: (key, params) => translate(dict, key, params),
    };
}
