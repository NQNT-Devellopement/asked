<?php

namespace App\Enums;

enum Locale: string
{
    case English = 'en';
    case French = 'fr';

    /**
     * Native display name for this locale (shown in switchers).
     */
    public function nativeName(): string
    {
        return match ($this) {
            self::English => 'English',
            self::French => 'Français',
        };
    }

    /**
     * Two-letter language code (matches the enum value).
     */
    public function code(): string
    {
        return $this->value;
    }

    /**
     * Try to resolve a locale from a raw string. Returns null when unsupported.
     */
    public static function tryFromString(?string $value): ?self
    {
        if ($value === null) {
            return null;
        }

        $normalized = strtolower(substr($value, 0, 2));

        return self::tryFrom($normalized);
    }

    /**
     * The default locale used when nothing else can be resolved.
     */
    public static function default(): self
    {
        return self::English;
    }

    /**
     * All supported locales.
     *
     * @return array<self>
     */
    public static function supported(): array
    {
        return self::cases();
    }
}
