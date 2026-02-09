<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Facture extends Model
{
    use HasFactory;

    protected $table = 'factures';

   
    public $timestamps = false;

    protected $fillable = [
        'montant',         // Montant de la facture
        'mdePaiement',     // Mode de paiement
        'transactionId',   // ID de transaction (généré auto)
        'status',          // Statut de la facture
        'paidAt',          // Date de paiement
        'id_intervention', // FK vers intervention
    ];

  
    protected $casts = [
        'montant' => 'decimal:2',  // Montant avec 2 décimales
        'createdAt' => 'datetime', // Cast en objet Carbon
        'updatedAt' => 'datetime', // Cast en objet Carbon
        'paidAt' => 'datetime',    // Cast en objet Carbon
    ];

   // Constantes pour les noms des colonnes de timestamps personnalisés
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    // statut: En attente
    const STATUS_EN_ATTENTE = 'en_attente';

    
    const STATUS_PAYEE = 'payee';

   // statut: Annulée
    const STATUS_ANNULEE = 'annulee';

    // statut: Remboursée
    const STATUS_REMBOURSEE = 'remboursee';

   // mode de paiement: Espèces
    const MODE_CASH = 'cash';

    // mode de paiement: Mobile Money
    const MODE_MOBILE_MONEY = 'mobile_money';

   // mode de paiement: Carte bancaire
    const MODE_CARTE_BANCAIRE = 'carte_bancaire';

    // mode de paiement: Virement bancaire
    const MODE_VIREMENT = 'virement';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($facture) {
            // Générer un ID de transaction unique : TRX-timestamp-random
            // Utilise time() pour le timestamp et md5(uniqid()) pour l'aléatoire
            $facture->transactionId = 'TRX-' . time() . '-' . strtoupper(substr(md5(uniqid()), 0, 8));
        });
    }

   
    public function intervention(): BelongsTo
    {
        return $this->belongsTo(Intervention::class, 'id_intervention');
    }


    public function demande(): HasOneThrough
    {
        return $this->hasOneThrough(
            Demande::class,
            Intervention::class,
            'id',          // Clé étrangère sur interventions
            'id',          // Clé étrangère sur demandes
            'id_intervention', // Clé locale
            'id_demande'       // Clé seconde
        );
    }

    public function client(): HasOneThrough
    {
        return $this->hasOneThrough(
            Client::class,
            Intervention::class,
            'id',
            'id',
            'id_intervention',
            'id_demande'
        )->through('intervention');
    }

    public function depanneur(): HasOneThrough
    {
        return $this->hasOneThrough(
            Depanneur::class,
            Intervention::class,
            'id',
            'id',
            'id_intervention',
            'id_depanneur'
        )->through('intervention');
    }

    
    public function scopePayee($query)
    {
        return $query->where('status', self::STATUS_PAYEE);
    }

    public function scopeEnAttente($query)
    {
        return $query->where('status', self::STATUS_EN_ATTENTE);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('createdAt', now()->month)
                     ->whereYear('createdAt', now()->year);
    }

    public function scopeParIntervention($query, $interventionId)
    {
        return $query->where('id_intervention', $interventionId);
    }

    public function getMdePaiementLabelAttribute(): string
    {
        $labels = [
            self::MODE_CASH => 'Espèces',
            self::MODE_MOBILE_MONEY => 'Mobile Money',
            self::MODE_CARTE_BANCAIRE => 'Carte bancaire',
            self::MODE_VIREMENT => 'Virement bancaire',
        ];

        return $labels[$this->mdePaiement] ?? $this->mdePaiement;
    }

    public function getStatutLabelAttribute(): string
    {
        $labels = [
            self::STATUS_EN_ATTENTE => 'En attente',
            self::STATUS_PAYEE => 'Payée',
            self::STATUS_ANNULEE => 'Annulée',
            self::STATUS_REMBOURSEE => 'Remboursée',
        ];

        return $labels[$this->status] ?? 'Inconnu';
    }

   
    public function getStatutColorAttribute(): string
    {
        $colors = [
            self::STATUS_EN_ATTENTE => 'warning',
            self::STATUS_PAYEE => 'success',
            self::STATUS_ANNULEE => 'danger',
            self::STATUS_REMBOURSEE => 'info',
        ];

        return $colors[$this->status] ?? 'secondary';
    }

   
    public function getEstPayeeAttribute(): bool
    {
        return $this->status === self::STATUS_PAYEE;
    }

   
    public function getEstEnAttenteAttribute(): bool
    {
        return $this->status === self::STATUS_EN_ATTENTE;
    }

    
    public function getMontantFormateAttribute(): string
    {
        return number_format($this->montant, 0, ',', ' ') . ' CFA';
    }

    
    public function getAEtPayeeAttribute(): bool
    {
        return $this->est_payee;
    }

   
    public function setMdePaiementAttribute(string $value): void
    {
        $validModes = [
            self::MODE_CASH,
            self::MODE_MOBILE_MONEY,
            self::MODE_CARTE_BANCAIRE,
            self::MODE_VIREMENT,
        ];

        if (!in_array($value, $validModes)) {
            throw new \InvalidArgumentException("Mode de paiement invalide: {$value}");
        }

        $this->attributes['mdePaiement'] = $value;
    }


    public function setStatusAttribute(string $value): void
    {
        $validStatuses = [
            self::STATUS_EN_ATTENTE,
            self::STATUS_PAYEE,
            self::STATUS_ANNULEE,
            self::STATUS_REMBOURSEE,
        ];

        if (!in_array($value, $validStatuses)) {
            throw new \InvalidArgumentException("Statut invalide: {$value}");
        }

        $this->attributes['status'] = $value;
    }

   
    public function marquerCommePayee(): bool
    {
        return $this->update([
            'status' => self::STATUS_PAYEE,
            'paidAt' => now(),
        ]);
    }


    public function marquerCommeAnnulee(): bool
    {
        return $this->update(['status' => self::STATUS_ANNULEE]);
    }

     
    public function marquerCommeRemboursee(): bool
    {
        return $this->update(['status' => self::STATUS_REMBOURSEE]);
    }

    
    public function payer(string $modePaiement): bool
    {
        // Valider le mode de paiement
        $this->mdePaiement = $modePaiement;

        return $this->marquerCommePayee();
    }

    
    public function estPayable(): bool
    {
        return $this->status === self::STATUS_EN_ATTENTE;
    }

    // Récupérer l'intervention avec ses relations chargées
    public function getInterventionWithRelations(): Intervention
    {
        return $this->intervention()->with(['demande.client', 'depanneur'])->first();
    }

    // Générer les données pour le PDF de la facture
    public function generatePdfData(): array
    {
        return [
            'transactionId' => $this->transactionId,
            'montant' => $this->montant,
            'montantFormate' => $this->montant_formate,
            'mdePaiement' => $this->mde_paiement_label,
            'status' => $this->statut_label,
            'dateCreation' => $this->createdAt->format('d/m/Y'),
            'datePaiement' => $this->paidAt?->format('d/m/Y'),
            'intervention' => [
                'id' => $this->intervention->id,
                'date' => $this->intervention->createdAt->format('d/m/Y'),
                'coutPiece' => $this->intervention->coutPiece,
                'coutMainOeuvre' => $this->intervention->coutMainOeuvre,
            ],
            'client' => [
                'nom' => $this->intervention->demande->client->fullName,
                'email' => $this->intervention->demande->client->email,
                'telephone' => $this->intervention->demande->client->phone,
            ],
            'depanneur' => [
                'etablissement' => $this->intervention->depanneur->etablissement_name,
                'ifu' => $this->intervention->depanneur->IFU,
            ],
        ];
    }
}

