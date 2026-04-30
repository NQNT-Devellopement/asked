<?php

namespace App\Enums;

enum OverlayPreset: string
{
    case Editorial = 'editorial';
    case BannerBottom = 'banner-bottom';
    case CardCorner = 'card-corner';
    case Quote = 'quote';

    /**
     * Get the human-readable label for the preset.
     */
    public function label(): string
    {
        return match ($this) {
            self::Editorial => 'Editorial',
            self::BannerBottom => 'Banner Bottom',
            self::CardCorner => 'Card Corner',
            self::Quote => 'Quote',
        };
    }
}
