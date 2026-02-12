# 📡 API Reference - GoAssist

## 🔐 Authentication Endpoints

### Register Client
```
POST /api/client/register
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "0612345678",
  "password": "password",
  "fullName": "John Doe"
}

Response (201):
{
  "success": true,
  "user": { id, email, token },
  "redirect": "/demande/nouvelle"
}
```

### OAuth Login
```
GET /auth/{provider}
→ Redirige vers Google/Facebook login

GET /auth/{provider}/callback
→ Callback d'OAuth, crée session et redirige
```

### Logout
```
POST /logout
Authorization: Bearer {token}

Response (200):
{ "success": true }
```

---

## 🆘 Demande Endpoints (Client)

### Créer une demande
```
POST /api/demandes
Authorization: Bearer {token}
Content-Type: application/json

{
  "latitude": 48.8566,
  "longitude": 2.3522,
  "vehicle_type": "voiture",
  "typePanne": "batterie_a_plat",
  "descriptionProbleme": "La batterie ne démarre plus",
  "phone": "0612345678"
}

Response (201):
{
  "success": true,
  "message": "Demande créée avec succès!",
  "demande": {
    "id": 1,
    "codeDemande": "DEM-20260212-00001",
    "status": "en_attente"
  },
  "redirect": "/client/demande/1/suivi"
}
```

### Récupérer mes demandes
```
GET /api/demandes
Authorization: Bearer {token}

Response (200):
[
  {
    "id": 1,
    "codeDemande": "DEM-20260212-00001",
    "status": "acceptee",
    "vehicle_type": "voiture",
    "typePanne": "batterie_a_plat",
    "localisation": "48.8566,2.3522",
    "createdAt": "2026-02-12T10:30:00Z"
  }
]
```

### Détails d'une demande
```
GET /api/demandes/{id}
Authorization: Bearer {token}

Response (200):
{
  "id": 1,
  "codeDemande": "DEM-20260212-00001",
  "status": "en_cours",
  "vehicle_type": "voiture",
  "typePanne": "batterie_a_plat",
  "localisation": "48.8566,2.3522",
  "descriptionProbleme": "...",
  "depanneur": {
    "id": 5,
    "etablissement_name": "Jean Dupont",
    "phone": "0698765432",
    "distance": 3.2,
    "estimated_time": 15
  },
  "createdAt": "2026-02-12T10:30:00Z",
  "acceptedAt": "2026-02-12T10:35:00Z"
}
```

### Annuler une demande
```
POST /api/demandes/{id}/cancel
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Demande annulée"
}

Error (400):
{
  "error": "Cette demande ne peut pas être annulée"
}
```

---

## 🔧 Depanneurs Endpoints

### Obtenir dépanneurs proches
```
GET /api/depanneurs/nearby?latitude=48.8566&longitude=2.3522&vehicle_type=voiture&radius=10

Response (200):
{
  "success": true,
  "depanneurs": [
    {
      "id": 5,
      "name": "Jean Dupont - Garage Auto Expert",
      "rating": 4.8,
      "reviews": 152,
      "distance": 3.2,
      "estimated_time": 15,
      "price_min": 50,
      "price_max": 80,
      "specialities": "Voiture, Moto",
      "phone": "0698765432",
      "avatar": "https://..."
    },
    {
      "id": 6,
      "name": "Marie Kouassi - SOS Dépannage",
      "rating": 4.5,
      "reviews": 89,
      "distance": 5.7,
      "estimated_time": 20,
      "price_min": 45,
      "price_max": 75,
      "specialities": "Moto, Scooter",
      "phone": "0687654321",
      "avatar": "https://..."
    }
  ]
}
```

### Accepter une demande (Dépanneur)
```
POST /api/depanneur/demandes/{demande_id}/accepter
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Demande acceptée"
}
```

### Démarrer une intervention
```
POST /api/depanneur/interventions/{intervention_id}/start
Authorization: Bearer {token}

{
  "latitude": 48.8566,
  "longitude": 2.3522
}

Response (200):
{
  "success": true,
  "intervention": { id, status: "en_cours" }
}
```

### Terminer une intervention
```
POST /api/depanneur/interventions/{intervention_id}/end
Authorization: Bearer {token}

{
  "price": 65
}

Response (200):
{
  "success": true,
  "intervention": { id, status: "terminee" }
}
```

### Mettre à jour position (Dépanneur)
```
POST /api/depanneur/location
Authorization: Bearer {token}

{
  "latitude": 48.8566,
  "longitude": 2.3522
}

Response (200):
{
  "success": true
}
```

---

## 💳 Paiement Endpoints

### Traiter un paiement
```
POST /api/demandes/{id}/payment
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 65,
  "method": "card",
  "card_data": {
    "cardNumber": "4532123456789012",
    "cardHolder": "John Doe",
    "expiryDate": "12/25",
    "cvv": "123"
  }
}

Alternative pour espèces:
{
  "amount": 65,
  "method": "cash"
}

Alternative pour Mobile Money:
{
  "amount": 65,
  "method": "mobile"
}

Response (200):
{
  "success": true,
  "message": "Paiement traité avec succès",
  "facture": {
    "id": 1,
    "code": "FAC-20260212101530",
    "montant": 65
  }
}
```

---

## ⭐ Évaluation Endpoints

### Évaluer une intervention
```
POST /api/demandes/{id}/evaluate
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent service, très professionnel!"
}

Response (200):
{
  "success": true,
  "message": "Évaluation enregistrée"
}
```

---

## 📊 Admin Endpoints

### Statistiques globales
```
GET /admin/api/stats
Authorization: Bearer {admin-token}

Response (200):
{
  "total_clients": 1234,
  "total_depanneurs": 567,
  "depanneurs_actifs": 450,
  "total_demandes": 5678,
  "demandes_terminées": 5200,
  "revenue_total": 156000
}
```

### Lister les clients
```
GET /admin/api/clients?page=1&limit=50
Authorization: Bearer {admin-token}

Response (200):
[
  {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "0612345678",
    "demandes_count": 5,
    "createdAt": "2026-01-15"
  }
]
```

### Lister les dépanneurs
```
GET /admin/api/depanneurs?page=1&limit=50
Authorization: Bearer {admin-token}

Response (200):
[
  {
    "id": 5,
    "etablissement_name": "Jean Dupont",
    "email": "jean@example.com",
    "phone": "0698765432",
    "isActive": true,
    "rating": 4.8,
    "interventions_count": 234,
    "revenue": 15600
  }
]
```

### Lister les demandes
```
GET /admin/api/demandes?status=terminee&page=1&limit=50
Authorization: Bearer {admin-token}

Response (200):
[
  {
    "id": 1,
    "codeDemande": "DEM-20260212-00001",
    "status": "terminee",
    "client": { id, fullName },
    "depanneur": { id, etablissement_name },
    "price": 65,
    "rating": 5,
    "createdAt": "2026-02-12"
  }
]
```

---

## 🔔 Notifications Endpoints

### Récupérer mes notifications
```
GET /api/depanneur/notifications
Authorization: Bearer {token}

Response (200):
[
  {
    "id": 1,
    "type": "nouvelle_demande",
    "title": "Nouvelle demande d'assistance",
    "content": "Jean Dupont a besoin d'aide (Batterie à plat)",
    "is_read": false,
    "createdAt": "2026-02-12T10:30:00Z"
  }
]
```

### Marquer une notification comme lue
```
POST /api/depanneur/notifications/{id}/read
Authorization: Bearer {token}

Response (200):
{
  "success": true
}
```

---

## 🛠️ Erreurs Courantes

### 401 - Non authentifié
```json
{
  "error": "Non authentifié"
}
```
**Solution:** Ajouter le header `Authorization: Bearer {token}`

### 403 - Accès refusé
```json
{
  "error": "Accès non autorisé"
}
```
**Solution:** Vous n'avez pas les permissions pour cette action

### 404 - Ressource non trouvée
```json
{
  "error": "Ressource non trouvée"
}
```
**Solution:** Vérifier l'ID et l'endpoint

### 422 - Validation échouée
```json
{
  "errors": {
    "latitude": ["Latitude doit être un nombre"]
  }
}
```
**Solution:** Vérifier le format des données envoyées

### 500 - Erreur serveur
```json
{
  "error": "Erreur lors du traitement"
}
```
**Solution:** Vérifier les logs serveur

---

## 📝 Statuts Demande

| Statut | Description |
|--------|-------------|
| `en_attente` | En attente d'acceptation par un dépanneur |
| `acceptee` | Acceptée, dépanneur en route |
| `en_cours` | Intervention en cours |
| `terminee` | Intervention terminée |
| `annulee` | Demande annulée par le client |

---

## 🔑 Types de Panne

| Type | Description |
|------|-------------|
| `batterie_a_plat` | Batterie déchargée |
| `pneu_creve` | Pneu crevé |
| `panne_moteur` | Panne moteur |
| `accident_leger` | Accident léger |
| `panne_carburant` | Plus de carburant |
| `autre` | Autre problème |

---

## 🚗 Types de Véhicule

| Type | Description |
|------|-------------|
| `voiture` | Voiture de tourisme |
| `moto` | Motocyclette/Scooter |
| `camion` | Camion/Utilitaire |

---

**Documentation mise à jour:** 12 février 2026
**Version API:** 1.0.0
