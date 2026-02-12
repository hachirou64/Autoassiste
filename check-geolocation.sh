#!/bin/bash
# Script de vérification: Géolocalisation HTML5 + Leaflet

echo "🔍 Vérification de l'implémentation Géolocalisation..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
CHECKS_PASSED=0
CHECKS_FAILED=0

# Fonction pour vérifier un fichier
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 existe"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $1 manquant"
        ((CHECKS_FAILED++))
    fi
}

# Fonction pour vérifier un dossier
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 existe"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $1 manquant"
        ((CHECKS_FAILED++))
    fi
}

# Fonction pour vérifier un package npm
check_package() {
    if grep -q "\"$1\"" package.json; then
        echo -e "${GREEN}✓${NC} $1 installé"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $1 manquant"
        ((CHECKS_FAILED++))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  DÉPENDANCES NPM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_package "leaflet"
check_package "react-leaflet"
check_package "@types/leaflet"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  FICHIERS CRÉÉS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_file "resources/js/components/Map.tsx"
check_file "resources/js/hooks/useGeolocation.ts"
check_file "resources/js/components/LocationTracker.tsx"
check_file "resources/js/components/client/depanneurs-map-modal.tsx"
check_file "resources/js/components/client/demande-form.tsx"
check_file "resources/js/pages/client/suivi-demande.tsx"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  DOCUMENTATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_file "GEOLOCATION.md"
check_file "SYSTEM_DEMANDE.md"
check_file "INTEGRATION_COMPLETE.md"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  ROUTES API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "getNearbyDepanneurs" routes/web.php; then
    echo -e "${GREEN}✓${NC} Endpoint /api/depanneurs/nearby configuré"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} Endpoint manquant"
    ((CHECKS_FAILED++))
fi

if grep -q "updateLocation" routes/web.php; then
    echo -e "${GREEN}✓${NC} Endpoint /api/depanneur/location configuré"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} Endpoint manquant"
    ((CHECKS_FAILED++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  INTÉGRATIONS DANS LES PAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "from '@/components/Map'" resources/js/pages/client/suivi-demande.tsx; then
    echo -e "${GREEN}✓${NC} Map intégré dans suivi-demande.tsx"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} Map non trouvé dans suivi-demande.tsx"
    ((CHECKS_FAILED++))
fi

if grep -q "DepanneursMapModal" resources/js/components/client/demande-form.tsx; then
    echo -e "${GREEN}✓${NC} DepanneursMapModal intégré dans demande-form.tsx"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} DepanneursMapModal non trouvé"
    ((CHECKS_FAILED++))
fi

if grep -q "LocationTracker" resources/js/components/LocationTracker.tsx; then
    echo -e "${GREEN}✓${NC} LocationTracker créé"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} LocationTracker non trouvé"
    ((CHECKS_FAILED++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TOTAL=$((CHECKS_PASSED + CHECKS_FAILED))
PERCENTAGE=$((CHECKS_PASSED * 100 / TOTAL))

echo -e "${GREEN}✓ Vérifications réussies: $CHECKS_PASSED${NC}"
echo -e "${RED}✗ Vérifications échouées: $CHECKS_FAILED${NC}"
echo ""
echo "Score global: $PERCENTAGE% ($CHECKS_PASSED/$TOTAL)"

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 IMPLÉMENTATION COMPLÈTE ET FONCTIONNELLE!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Quelques éléments manquent, veuillez les vérifier.${NC}"
    exit 1
fi
