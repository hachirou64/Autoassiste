<?php

namespace App\Mail;

use App\Models\Utilisateur;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountCreatedByAdmin extends Mailable
{
    use Queueable, SerializesModels;

    public Utilisateur $user;
    public string $temporaryPassword;

    /**
     * Create a new message instance.
     */
    public function __construct(Utilisateur $user, string $temporaryPassword = '')
    {
        $this->user = $user;
        $this->temporaryPassword = $temporaryPassword;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre compte GoAssist a été créé par l\'administrateur',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.account-created-by-admin',
            with: [
                'name' => $this->user->fullName,
                'email' => $this->user->email,
                'temporaryPassword' => $this->temporaryPassword,
                'type' => $this->user->typeCompte->name ?? 'utilisateur',
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

