# TODO: Notification de demande refusée au client

## Étapes complétées:

- [x] 1. Ajouter le type de notification `TYPE_DEMANDE_REFUSEE` dans le modèle Notification
- [x] 2. Mettre à jour les méthodes du modèle Notification (labels, icons, colors)
- [x] 3. Modifier la méthode `refuseDemande` dans DashboardController pour utiliser le bon type
- [x] 4. Ajouter le type `'demande_refusee'` dans les types TypeScript client

## Détails:

### 1. Modèle Notification (app/Models/Notification.php)
- Ajouter la constante `TYPE_DEMANDE_REFUSEE = 'demande_refusee'`
- Ajouter le label, l'icône et la couleur pour ce type

### 2. DashboardController (app/Http/Controllers/DashboardController.php)
- Modifier la méthode `refuseDemande` pour utiliser `TYPE_DEMANDE_REFUSEE` au lieu de `'annulee'`
- Mettre à jour le message de notification

### 3. Types client (resources/js/types/client.ts)
- Ajouter `'demande_refusee'` à `ClientNotificationType`

## Résultat:
Lorsqu'un dépanneur refuse une demande, le client reçoit maintenant une notification "Demande refusée" sur son dashboard, avec un message clair indiquant que le dépanneur a refusé la demande et qu'il doit en trouver un autre.

