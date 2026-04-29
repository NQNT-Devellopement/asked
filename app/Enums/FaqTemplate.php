<?php

namespace App\Enums;

enum FaqTemplate: string
{
    case Minimal = 'minimal';
    case Grid = 'grid';
    case Timeline = 'timeline';

    /**
     * Get the display label for the template.
     */
    public function label(): string
    {
        return ucfirst($this->value);
    }
}
