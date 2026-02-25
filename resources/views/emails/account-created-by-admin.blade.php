<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre compte GoAssist a été créé</title>
</head>
<body style="font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Compte créé par l'administrateur</h1>
    </div>
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2>Bonjour {{ $name }},</h2>
        
        <p>Un compte <strong>GoAssist</strong> a été créé pour vous par l'administrateur de la plateforme.</p>
        
        <h3>Informations du compte :</h3>
        <ul>
            <li><strong>Email :</strong> {{ $email }}</li>
            <li><strong>Type de compte :</strong> {{ $type }}</li>
            @if($temporaryPassword)
            <li><strong>Mot de passe temporaire :</strong> {{ $temporaryPassword }}</li>
            @endif
        </ul>
        
        <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <strong>⚠️ Action requise :</strong> Veuillez changer votre mot de passe lors de votre première connexion.
        </div>
        
        <a href="{{ config('app.url') }}/login" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Se connecter
        </a>
        
        <p style="margin-top: 30px;">
            Si vous avez des questions, contactez l'administrateur.
        </p>
        
        <p>Cordialement,<br>L'équipe <strong>GoAssist</strong></p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
        <p>&copy; {{ date('Y') }} GoAssist - Tous droits réservés</p>
    </div>
</body>
</html>

