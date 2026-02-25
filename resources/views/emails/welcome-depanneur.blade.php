<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur GoAssist Pro</title>
</head>
<body style="font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Bienvenue sur GoAssist Pro !</h1>
    </div>
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2>Bonjour {{ $name }},</h2>
        
        <p>Nous sommes ravis de vous accueillir sur <strong>GoAssist Pro</strong>, la plateforme professionnelle pour les dépanneurs !</p>
        
        <h3>Votre compte a été créé avec succès</h3>
        
        <p>Informations du compte :</p>
        <ul>
            <li><strong>Email :</strong> {{ $email }}</li>
            <li><strong>Établissement :</strong> {{ $etablissement }}</li>
        </ul>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <strong>⚠️ Important :</strong> Votre compte est en attente de validation par l'administrateur. Vous ne pourrez pas recevoir de demandes d'assistance avant cette validation.
        </div>
        
        <p>Une fois votre compte validé, vous pourrez :</p>
        <ul>
            <li>Recevoir des demandes d'assistance véhicule</li>
            <li>Gérer vos interventions</li>
            <li>Suivre vos revenus</li>
            <li>Notifier votre disponibilité</li>
        </ul>
        
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

