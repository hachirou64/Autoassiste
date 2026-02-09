# Plan : Correction Frontend Dashboard Client

## Objectif
Faire en sorte que le dashboard client s'affiche avec du contenu en utilisant des données qui peuvent être remplacées par de vrais appels API.

## Modifications effectuées ✓

### 1. `resources/js/components/ui/loading-spinner.tsx` ✓
- Créé le composant de loading spinner avec plusieurs variantes:
  - `LoadingSpinner` - Petit spinner avec option de texte
  - `LoadingPage` - Page de chargement complète
  - `LoadingCard` - Carte de chargement squelette
  - `LoadingGrid` - Grille de cartes de chargement

### 2. `resources/js/pages/client-dashboard.tsx` ✓
- Ajout des states: `loading`, `data`, `error`
- Création de la fonction `fetchDashboardData()` simulée
- Ajout de `useEffect` pour charger les données au montage
- Affichage d'un loader (`LoadingPage`) pendant le chargement
- Affichage d'un message d'erreur si nécessaire
- Les données mockées sont conservées comme fallback
- La fonction est prête à être remplacée par un vrai appel API

### 3. Types ajoutés ✓
- Interface `DashboardData` pour typer les données du dashboard
- Integration avec les types existants (`ClientStats`, `ClientNotification`, etc.)

## Structure des données

```typescript
interface DashboardData {
    stats: ClientStats;
    notifications: ClientNotification[];
    history: InterventionHistoryItem[];
    profile: UserProfileType;
    profileStats: {
        total_demandes: number;
        demandes_terminees: number;
        montant_total_depense: number;
        membre_depuis: string;
    };
}
```

## Pour connecter à une vraie API (backend Laravel)

Remplacer la fonction `fetchDashboardData` dans `client-dashboard.tsx`:

```typescript
const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
        // Appel API réel
        const response = await fetch('/api/client/dashboard');
        if (!response.ok) throw new Error('Erreur API');
        const dashboardData = await response.json();
        setData(dashboardData);
    } catch (err) {
        setError('Erreur lors du chargement des données...');
        console.error(err);
    } finally {
        setLoading(false);
    }
}, []);
```

## Résultat attendu ✓
- Dashboard qui affiche un loader au chargement
- Après ~800ms, les données s'affichent correctement
- Données peuvent être facilement remplacées par de vrais appels API
- Pas de page vide au chargement

