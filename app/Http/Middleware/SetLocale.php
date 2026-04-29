<?php

namespace App\Http\Middleware;

use App\Enums\Locale;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Resolve and set the application locale for the request.
     *
     * Priority: authenticated user preference -> cookie -> Accept-Language
     * header -> application default. Anything unsupported falls through to
     * the default so we never crash on unexpected codes.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->resolve($request);

        App::setLocale($locale->value);

        return $next($request);
    }

    /**
     * Resolve the active locale for the request.
     */
    protected function resolve(Request $request): Locale
    {
        $userLocale = Locale::tryFromString($request->user()?->locale);

        if ($userLocale !== null) {
            return $userLocale;
        }

        $cookieLocale = Locale::tryFromString($request->cookie('locale'));

        if ($cookieLocale !== null) {
            return $cookieLocale;
        }

        $acceptLocale = Locale::tryFromString($request->getPreferredLanguage(
            array_map(fn (Locale $locale): string => $locale->value, Locale::supported()),
        ));

        return $acceptLocale ?? Locale::default();
    }
}
