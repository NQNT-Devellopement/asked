<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->foreignId('addressed_in_session_id')->nullable()->after('question_list_id')
                ->constrained('stream_sessions')->nullOnDelete();
            $table->timestamp('addressed_at')->nullable()->after('addressed_in_session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('addressed_in_session_id');
            $table->dropColumn('addressed_at');
        });
    }
};
