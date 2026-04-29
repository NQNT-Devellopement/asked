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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_list_id')->nullable()->constrained()->nullOnDelete();
            $table->string('author_name', 80)->nullable();
            $table->text('body');
            $table->string('status')->default('pending');
            $table->string('answer_source_type')->nullable();
            $table->string('answer_source_url')->nullable();
            $table->string('answer_source_label', 120)->nullable();
            $table->timestamp('answered_at')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->string('submitter_ip_hash', 64)->nullable();
            $table->timestamps();

            $table->index(['team_id', 'status']);
            $table->index(['team_id', 'question_list_id', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
