<?php

namespace App\Enums;

enum FaqBackground: string
{
    case Cream = 'cream';
    case Ink = 'ink';
    case Paper = 'paper';
    case Noir = 'noir';

    /**
     * Get the display label for the background.
     */
    public function label(): string
    {
        return ucfirst($this->value);
    }
}
