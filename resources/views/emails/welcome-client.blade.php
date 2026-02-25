<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur GoAssist</title>
</head>
<body style="font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Bienvenue sur GoAssist !</h1>
    </div>
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2>Bonjour {{ $name }},</h2>
        
        <p>Nous sommes ravis de vous accueillir sur <strong>GoAssist</strong>, votre solution d'assistance véhicule de confiance !</p>
        
        <h3>Votre compte a été créé avec succès</h3>
        
        <p>Voici vos identifiants de connexion :</p>
        <ul>
            <li><strong>Email :</strong> {{ $email }}</li>
        </ul>
        
        <p>Avec GoAssist, vous pouvez :</p>
        <ul>
            <li>Trouver un dépanneur proche de vous en quelques clics</li>
            <li>Demander de l'assistance pour votre véhicule</li>
            <li>Suivre vos interventions et factures</li>
            <li>Évaluer les services reçus</li>
        </ul>
        
        <a href="{{ config('app.url') }}/demande/nouvelle" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Faire une demande d'assistance
        </a>
        
        <p style="margin-top: 30px;">
            Si vous avez des questions, n'hésitez pas à nous contacter.
        </p>
        
        <p>Cordialement,<br>L'équipe <strong>GoAssist</strong></p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
        <p>&copy; {{ date('Y') }} GoAssist - Tous droits réservés</p>
    </div>
</body>
</html>

