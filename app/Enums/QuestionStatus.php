<?php

namespace App\Enums;

enum QuestionStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Addressed = 'addressed';
    case Answered = 'answered';
}
