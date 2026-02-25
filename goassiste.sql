-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : mer. 25 fév. 2026 à 17:48
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `goassiste`
--

-- --------------------------------------------------------

--
-- Structure de la table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

CREATE TABLE `clients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id`, `fullName`, `email`, `phone`, `createdAt`, `updatedAt`, `deleted_at`) VALUES
(12, 'BAPARAPE Houzerou', 'houzerou@gmail.com', '0140419296', '2026-02-23 14:07:22', '2026-02-23 14:07:22', NULL),
(15, 'SALIFOU Amidou', 'amidou@gmail.com', '0144548497', '2026-02-25 09:09:30', '2026-02-25 09:09:30', NULL),
(16, 'BAPARAPE Adam', 'adam@gmail.com', '0164084484', '2026-02-25 15:17:16', '2026-02-25 15:17:16', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('pending','read','replied') NOT NULL DEFAULT 'pending',
  `admin_response` text DEFAULT NULL,
  `replied_at` timestamp NULL DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `demandes`
--

CREATE TABLE `demandes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `codeDemande` varchar(255) NOT NULL,
  `localisation` varchar(255) NOT NULL,
  `descriptionProbleme` text NOT NULL,
  `vehicle_type` enum('voiture','moto') NOT NULL DEFAULT 'voiture',
  `typePanne` enum('panne_seche','batterie','crevaison','moteur','transmission','freins','carrosserie','electrique','vitres','climatisation','autre') NOT NULL DEFAULT 'autre',
  `status` enum('en_attente','acceptee','en_cours','terminee','annulee') NOT NULL DEFAULT 'en_attente',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `acceptedAt` timestamp NULL DEFAULT NULL,
  `completedAt` timestamp NULL DEFAULT NULL,
  `id_client` bigint(20) UNSIGNED NOT NULL,
  `id_depanneur` bigint(20) UNSIGNED DEFAULT NULL,
  `id_zone` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `demandes`
--

INSERT INTO `demandes` (`id`, `codeDemande`, `localisation`, `descriptionProbleme`, `vehicle_type`, `typePanne`, `status`, `createdAt`, `updatedAt`, `acceptedAt`, `completedAt`, `id_client`, `id_depanneur`, `id_zone`) VALUES
(41, 'DEM-20260225-42123', '6.3618711,2.3977666', '', 'voiture', 'panne_seche', 'acceptee', '2026-02-25 15:18:50', '2026-02-25 15:20:23', '2026-02-25 14:20:23', NULL, 16, 7, NULL),
(42, 'DEM-20260225-13908', '6.361863,2.3977354', '', 'voiture', 'panne_seche', 'annulee', '2026-02-25 15:57:26', '2026-02-25 15:58:12', NULL, NULL, 15, NULL, NULL),
(43, 'DEM-20260225-12398', '6.3618669,2.397708', '', 'voiture', 'panne_seche', 'annulee', '2026-02-25 16:07:29', '2026-02-25 16:08:14', NULL, NULL, 15, NULL, NULL),
(44, 'DEM-20260225-76124', '6.3618623,2.397702', '', 'voiture', 'electrique', 'acceptee', '2026-02-25 16:13:55', '2026-02-25 16:14:57', '2026-02-25 15:14:57', NULL, 15, 7, NULL),
(45, 'DEM-20260225-49593', '6.3618641,2.397709', '', 'voiture', 'panne_seche', 'annulee', '2026-02-25 16:24:50', '2026-02-25 16:26:11', NULL, NULL, 15, NULL, NULL),
(46, 'DEM-20260225-44755', '6.3618357,2.3977254', '', 'moto', 'batterie', 'annulee', '2026-02-25 16:45:21', '2026-02-25 16:46:02', NULL, NULL, 12, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `depanneurs`
--

CREATE TABLE `depanneurs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `promoteur_name` varchar(255) NOT NULL,
  `etablissement_name` varchar(255) NOT NULL,
  `IFU` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `status` enum('disponible','occupe','hors_service') NOT NULL DEFAULT 'disponible',
  `isActive` tinyint(1) NOT NULL DEFAULT 0,
  `type_vehicule` enum('voiture','moto','les_deux') NOT NULL DEFAULT 'les_deux',
  `localisation_actuelle` varchar(100) DEFAULT NULL,
  `price_min` decimal(10,2) DEFAULT NULL,
  `price_max` decimal(10,2) DEFAULT NULL,
  `derniere_position_at` timestamp NULL DEFAULT NULL,
  `adresse` varchar(500) DEFAULT NULL,
  `services` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`services`)),
  `methode_payement` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`methode_payement`)),
  `disponibilite` varchar(50) DEFAULT NULL,
  `jours_travail` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`jours_travail`)),
  `numero_mobile_money` varchar(20) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `depanneurs`
--

INSERT INTO `depanneurs` (`id`, `promoteur_name`, `etablissement_name`, `IFU`, `email`, `phone`, `status`, `isActive`, `type_vehicule`, `localisation_actuelle`, `price_min`, `price_max`, `derniere_position_at`, `adresse`, `services`, `methode_payement`, `disponibilite`, `jours_travail`, `numero_mobile_money`, `createdAt`, `updatedAt`, `deleted_at`) VALUES
(5, 'hachirou', 'PRESSING', '01234567845', 'hachirou@gmail.com', '69162107', 'disponible', 1, 'voiture', '6.5176, 2.3495', NULL, NULL, NULL, 'Godomey', '[\"pneu\",\"climatisation\",\"batterie\",\"freinage\",\"moteur\",\"diagnostic\"]', '[\"especes\"]', '24h', '[\"lundi\",\"mardi\",\"mercredi\",\"jeudi\"]', NULL, '2026-02-23 13:47:47', '2026-02-25 10:12:50', '2026-02-25 09:12:50'),
(6, 'bio', 'ETS', '012453784512', 'bio@gmail.com', '69162107', 'hors_service', 1, 'voiture', '6.3618836,2.3977641', NULL, NULL, '2026-02-24 09:09:48', 'kpota', '[\"pneu\",\"climatisation\",\"freinage\",\"batterie\",\"diagnostic\",\"moteur\"]', '[\"especes\"]', '24h', '[\"lundi\",\"mardi\",\"mercredi\",\"jeudi\",\"vendredi\"]', NULL, '2026-02-23 14:04:10', '2026-02-25 16:41:12', NULL),
(7, 'houzerou', 'MECANIQUE', '01235486754', 'houzerou1@gmail.com', '0164084484', 'disponible', 1, 'les_deux', '6.3570, 2.3626', NULL, NULL, NULL, 'godomey', '[\"pneu\",\"climatisation\",\"freinage\",\"batterie\",\"diagnostic\",\"moteur\",\"assistance\"]', '[\"especes\"]', '24h', '[\"lundi\",\"mardi\",\"mercredi\",\"jeudi\",\"vendredi\"]', NULL, '2026-02-25 14:40:41', '2026-02-25 16:43:51', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `depanneur_zones`
--

CREATE TABLE `depanneur_zones` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_depanneur` bigint(20) UNSIGNED NOT NULL,
  `id_zone` bigint(20) UNSIGNED NOT NULL,
  `priorite` int(11) NOT NULL DEFAULT 1,
  `dateAjout` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `depanneur_zones`
--

INSERT INTO `depanneur_zones` (`id`, `id_depanneur`, `id_zone`, `priorite`, `dateAjout`) VALUES
(9, 5, 1, 1, '2026-02-23 12:47:48'),
(10, 5, 2, 1, '2026-02-23 12:47:48'),
(11, 5, 3, 1, '2026-02-23 12:47:48'),
(12, 5, 4, 1, '2026-02-23 12:47:48'),
(13, 5, 5, 1, '2026-02-23 12:47:48'),
(14, 5, 6, 1, '2026-02-23 12:47:48'),
(15, 5, 7, 1, '2026-02-23 12:47:48'),
(16, 6, 1, 1, '2026-02-23 13:04:10'),
(17, 6, 2, 1, '2026-02-23 13:04:10'),
(18, 6, 3, 1, '2026-02-23 13:04:10'),
(19, 6, 4, 1, '2026-02-23 13:04:10'),
(20, 6, 5, 1, '2026-02-23 13:04:10'),
(21, 6, 6, 1, '2026-02-23 13:04:10'),
(22, 6, 7, 1, '2026-02-23 13:04:10'),
(23, 7, 1, 1, '2026-02-25 13:40:42'),
(24, 7, 2, 1, '2026-02-25 13:40:42'),
(25, 7, 3, 1, '2026-02-25 13:40:42'),
(26, 7, 4, 1, '2026-02-25 13:40:42'),
(27, 7, 5, 1, '2026-02-25 13:40:42'),
(28, 7, 6, 1, '2026-02-25 13:40:42'),
(29, 7, 7, 1, '2026-02-25 13:40:42');

-- --------------------------------------------------------

--
-- Structure de la table `factures`
--

CREATE TABLE `factures` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `mdePaiement` enum('cash','mobile_money','carte_bancaire','virement') NOT NULL DEFAULT 'cash',
  `transactionId` varchar(255) NOT NULL,
  `status` enum('en_attente','payee','annulee','remboursee') NOT NULL DEFAULT 'en_attente',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `paidAt` timestamp NULL DEFAULT NULL,
  `id_intervention` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `interventions`
--

CREATE TABLE `interventions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `piecesremplacees` varchar(255) DEFAULT NULL,
  `observations` text DEFAULT NULL,
  `note` int(11) DEFAULT NULL COMMENT 'Note de l''intervention (1-5)',
  `coutPiece` decimal(10,2) NOT NULL DEFAULT 0.00,
  `coutMainOeuvre` decimal(10,2) NOT NULL DEFAULT 0.00,
  `coutTotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('planifiee','en_cours','terminee','annulee') NOT NULL DEFAULT 'planifiee',
  `startedAt` timestamp NULL DEFAULT NULL,
  `completedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_demande` bigint(20) UNSIGNED NOT NULL,
  `id_depanneur` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `interventions`
--

INSERT INTO `interventions` (`id`, `piecesremplacees`, `observations`, `note`, `coutPiece`, `coutMainOeuvre`, `coutTotal`, `status`, `startedAt`, `completedAt`, `createdAt`, `updatedAt`, `id_demande`, `id_depanneur`) VALUES
(1, NULL, NULL, NULL, 0.00, 0.00, 0.00, 'planifiee', '2026-02-25 14:20:23', NULL, '2026-02-25 15:20:23', '2026-02-25 15:20:23', 41, 7),
(2, NULL, NULL, NULL, 0.00, 0.00, 0.00, 'planifiee', '2026-02-25 15:14:57', NULL, '2026-02-25 16:14:57', '2026-02-25 16:14:57', 44, 7);

-- --------------------------------------------------------

--
-- Structure de la table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_08_14_170933_add_two_factor_columns_to_users_table', 1),
(5, '2026_02_02_092141_create_type_comptes_table', 1),
(6, '2026_02_02_092142_create_clients_table', 1),
(7, '2026_02_02_092142_create_zones_table', 1),
(8, '2026_02_02_092143_create_depanneurs_table', 1),
(9, '2026_02_02_092143_create_utilisateur_table', 1),
(10, '2026_02_02_092144_create_demandes_table', 1),
(11, '2026_02_02_092144_create_depanneur_zones_table', 1),
(12, '2026_02_02_092144_create_interventions_table', 1),
(13, '2026_02_02_092144_create_services_table', 1),
(14, '2026_02_02_092145_create_factures_table', 1),
(15, '2026_02_02_092145_create_notifications_table', 1),
(16, '2026_02_02_092146_add_vehicle_type_to_depanneurs', 1),
(17, '2026_02_02_092147_add_vehicle_type_to_demandes', 1),
(18, '2026_02_02_092148_add_titre_to_notifications', 1),
(19, '2026_02_10_090000_rename_boolean_to_email_verified_in_utilisateurs', 1),
(20, '2026_02_11_000000_add_note_to_interventions_table', 1),
(21, '2026_02_11_140751_create_social_accounts_table', 1),
(22, '2026_02_17_120000_add_typePanne_to_demandes_table', 1),
(23, '2026_02_17_130000_add_missing_notification_types', 1),
(24, '2026_02_17_164626_add_jours_travail_to_depanneurs_table', 1),
(25, '2026_02_18_000000_add_registration_fields_to_depanneurs_table', 1),
(26, '2026_02_19_000000_add_isActive_to_utilisateurs_table', 1),
(27, '2026_02_20_000000_add_derniere_position_at_to_depanneurs_table', 1),
(28, '2026_02_21_000000_add_soft_deletes_tables', 1),
(29, '2026_02_22_000000_add_id_zone_to_demandes_table', 1),
(30, '2026_02_23_000000_add_price_min_max_to_depanneurs_table', 2),
(31, '2026_02_24_000000_create_contact_messages_table', 3);

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `message` text NOT NULL,
  `titre` varchar(255) DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_client` bigint(20) UNSIGNED DEFAULT NULL,
  `id_demande` bigint(20) UNSIGNED DEFAULT NULL,
  `id_depanneur` bigint(20) UNSIGNED DEFAULT NULL,
  `type` enum('nouvelle_demande','demande_recue','demande_acceptee','depannage_en_route','intervention_terminee','paiement_recu','alerte_systeme','evaluation','acceptee','terminee') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `notifications`
--

INSERT INTO `notifications` (`id`, `message`, `titre`, `isRead`, `createdAt`, `updatedAt`, `id_client`, `id_demande`, `id_depanneur`, `type`) VALUES
(23, 'Nouvelle demande: DEM-20260225-42123', NULL, 0, '2026-02-25 15:18:50', '2026-02-25 15:18:50', NULL, 41, 6, 'nouvelle_demande'),
(24, 'Nouvelle demande: DEM-20260225-42123', NULL, 0, '2026-02-25 15:18:51', '2026-02-25 15:18:51', NULL, 41, 7, 'nouvelle_demande'),
(25, 'Votre demande a été enregistrée. Code: DEM-20260225-42123', NULL, 1, '2026-02-25 15:18:51', '2026-02-25 15:19:18', 16, 41, NULL, 'demande_recue'),
(26, 'Le dépanneur MECANIQUE a accepté votre demande et arrive bientôt.', 'Demande acceptée', 1, '2026-02-25 15:20:23', '2026-02-25 16:40:09', 16, 41, 7, 'acceptee'),
(27, 'Nouvelle demande: DEM-20260225-13908', NULL, 0, '2026-02-25 15:57:26', '2026-02-25 15:57:26', NULL, 42, 6, 'nouvelle_demande'),
(28, 'Nouvelle demande: DEM-20260225-13908', NULL, 0, '2026-02-25 15:57:27', '2026-02-25 15:57:27', NULL, 42, 7, 'nouvelle_demande'),
(29, 'Votre demande a été enregistrée. Code: DEM-20260225-13908', NULL, 1, '2026-02-25 15:57:27', '2026-02-25 16:07:46', 15, 42, NULL, 'demande_recue'),
(30, 'Nouvelle demande: DEM-20260225-12398', NULL, 0, '2026-02-25 16:07:30', '2026-02-25 16:07:30', NULL, 43, 6, 'nouvelle_demande'),
(31, 'Nouvelle demande: DEM-20260225-12398', NULL, 0, '2026-02-25 16:07:30', '2026-02-25 16:07:30', NULL, 43, 7, 'nouvelle_demande'),
(32, 'Votre demande a été enregistrée. Code: DEM-20260225-12398', NULL, 1, '2026-02-25 16:07:30', '2026-02-25 16:13:10', 15, 43, NULL, 'demande_recue'),
(33, 'Nouvelle demande: DEM-20260225-76124', NULL, 0, '2026-02-25 16:13:55', '2026-02-25 16:13:55', NULL, 44, 6, 'nouvelle_demande'),
(34, 'Nouvelle demande: DEM-20260225-76124', NULL, 0, '2026-02-25 16:13:55', '2026-02-25 16:13:55', NULL, 44, 7, 'nouvelle_demande'),
(35, 'Votre demande a été enregistrée. Code: DEM-20260225-76124', NULL, 1, '2026-02-25 16:13:56', '2026-02-25 16:17:07', 15, 44, NULL, 'demande_recue'),
(36, 'Le dépanneur MECANIQUE a accepté votre demande et arrive bientôt.', 'Demande acceptée', 0, '2026-02-25 16:14:57', '2026-02-25 16:14:57', 15, 44, 7, 'acceptee'),
(37, 'Nouvelle demande: DEM-20260225-49593', NULL, 0, '2026-02-25 16:24:50', '2026-02-25 16:24:50', NULL, 45, 6, 'nouvelle_demande'),
(38, 'Votre demande a été enregistrée. Code: DEM-20260225-49593', NULL, 1, '2026-02-25 16:24:50', '2026-02-25 16:30:49', 15, 45, NULL, 'demande_recue'),
(39, 'Nouvelle demande: DEM-20260225-44755', NULL, 0, '2026-02-25 16:45:21', '2026-02-25 16:45:21', NULL, 46, 7, 'nouvelle_demande'),
(40, 'Votre demande a été enregistrée. Code: DEM-20260225-44755', NULL, 1, '2026-02-25 16:45:22', '2026-02-25 16:45:33', 12, 46, NULL, 'demande_recue');

-- --------------------------------------------------------

--
-- Structure de la table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `services`
--

CREATE TABLE `services` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_demande` bigint(20) UNSIGNED NOT NULL,
  `id_depanneur` bigint(20) UNSIGNED NOT NULL,
  `action` enum('remorquage','reparation_sur_place','changement_roue','depannage_batterie','fourniture_carburant','autre') NOT NULL,
  `dateAction` timestamp NOT NULL DEFAULT current_timestamp(),
  `commentaire` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('9X5esyWqA1yZSYAly7O8aRDgMn0gnZaQz95T6K0u', 23, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoibkNseTEwZEM3N1FNQUtoMUJ6SUVjQk9DbVNxMDgyV2YxVkpaWGozNyI7czoxNToianVzdF9sb2dnZWRfb3V0IjtiOjE7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDQ6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvZGVwYW5uZXVyL2RlbWFuZGVzIjtzOjU6InJvdXRlIjtzOjIyOiJkZXBhbm5ldXIuYXBpLmRlbWFuZGVzIjt9czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MjM7fQ==', 1772038102),
('lqRAuOloSwDNVlm1KCgTZuZ6S10t5oucRpAL0ifO', NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNkV0cnE0Rm1wMmdvcE1CaXh0VDVpVkx4VVFPc2JMWXhYZDRmM3ExViI7czoxNToianVzdF9sb2dnZWRfb3V0IjtiOjE7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1772031170);

-- --------------------------------------------------------

--
-- Structure de la table `social_accounts`
--

CREATE TABLE `social_accounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `provider_name` varchar(255) NOT NULL,
  `provider_id` varchar(255) NOT NULL,
  `provider_email` varchar(255) DEFAULT NULL,
  `provider_avatar` varchar(255) DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `refresh_token` text DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `type_comptes`
--

CREATE TABLE `type_comptes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `type_comptes`
--

INSERT INTO `type_comptes` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1, 'Admin', '2026-02-23 10:34:41', '2026-02-23 10:34:41'),
(2, 'Client', '2026-02-23 10:34:41', '2026-02-23 10:34:41'),
(3, 'Depanneur', '2026-02-23 10:34:41', '2026-02-23 10:34:41');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Test User', 'test@example.com', '2026-02-23 09:34:40', '$2y$12$UJZf6M6NXMnofUXmRGLj5.jG5DczHfje89UHgqemAe9FGyVfE/vt2', NULL, NULL, NULL, 'j2WSuhDzjk', '2026-02-23 09:34:41', '2026-02-23 09:34:41');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_By` varchar(255) DEFAULT NULL,
  `updatedBy` varchar(255) DEFAULT NULL,
  `DeleteedBy` varchar(255) DEFAULT NULL,
  `id_type_compte` bigint(20) UNSIGNED NOT NULL,
  `id_client` bigint(20) UNSIGNED DEFAULT NULL,
  `id_depanneur` bigint(20) UNSIGNED DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `fullName`, `email`, `password`, `email_verified`, `email_verified_at`, `isActive`, `createdAt`, `updatedAt`, `created_By`, `updatedBy`, `DeleteedBy`, `id_type_compte`, `id_client`, `id_depanneur`, `remember_token`, `deleted_at`) VALUES
(1, 'Administrateur', 'admin@goassiste.com', '$2y$12$h1V3xJ/uCuF6C.or.wPl3.q28ub2si3Wv2ZsRMpEMzemIPjD0gtwS', 1, NULL, 1, '2026-02-23 09:34:43', '2026-02-23 09:34:43', NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL),
(16, 'ADAM Nafirou', 'nafirou@gmail.com', '$2y$12$2ED8l5240eT4xq.warH/7eQqcDRH7W/mkmQroXwtMn1DDbSYx5PPW', 0, NULL, 1, '2026-02-23 09:38:35', '2026-02-23 09:38:35', NULL, NULL, NULL, 2, NULL, NULL, NULL, NULL),
(17, 'baparape hachirou', 'hachirou@gmail.com', '$2y$12$3tBjAqf.p0tTPR9L2/3S8use0tXbuAYvPDCWuc29DYWMv1hSMFIq.', 1, NULL, 1, '2026-02-23 12:47:48', '2026-02-25 09:12:50', NULL, NULL, NULL, 3, NULL, 5, NULL, '2026-02-25 09:12:50'),
(18, 'ADAM  bio', 'bio@gmail.com', '$2y$12$WY3FAdItLPKE2ud3PzpGROfDM.jGZOLC8i2ZTNo.3CIvlOkAAfK3G', 1, NULL, 1, '2026-02-23 13:04:10', '2026-02-23 13:04:38', NULL, NULL, NULL, 3, NULL, 6, NULL, NULL),
(19, 'BAPARAPE Houzerou', 'houzerou@gmail.com', '$2y$12$35vi22hHz034EpuY61AtC.uZfjNe5xEdwWW8326rdmouV7MdRPT1W', 0, NULL, 1, '2026-02-23 13:07:23', '2026-02-23 13:07:23', NULL, NULL, NULL, 2, 12, NULL, NULL, NULL),
(20, 'degbe igor', 'igor@gmail.com', '$2y$12$gt0X1sz3hJIvMJzhGbHgZOl3YUC8V767E3H9kbNTfKfIW/rKTRtwe', 0, NULL, 1, '2026-02-24 07:49:34', '2026-02-24 17:32:34', NULL, NULL, NULL, 2, NULL, NULL, 'SREPpZzrfzVIS0wvwM23pMyzzBc6Tt02ikadwt3elRsBlukphqeyHsRTupL8', NULL),
(21, 'ALI doro', 'ali@gmail.com', '$2y$12$1OLFOsGxvxGEDmfSVtMn.OTgCGN7MqkrmZTN5ZeMMJDHg0pfIvn7m', 0, NULL, 1, '2026-02-24 10:36:56', '2026-02-24 10:36:56', NULL, NULL, NULL, 2, NULL, NULL, NULL, NULL),
(22, 'SALIFOU Amidou', 'amidou@gmail.com', '$2y$12$VAPuIUK6JYd1y6n5jHuqnOpWJjIgrYmxdXIKU8MlcgrT/AbRJuIHa', 0, NULL, 1, '2026-02-25 08:09:31', '2026-02-25 08:09:31', NULL, NULL, NULL, 2, 15, NULL, NULL, NULL),
(23, 'BAPARAPE Houzerou', 'houzerou1@gmail.com', '$2y$12$GVhbBkZTrMt7dMaF5j4ZmeSgTKeS//.cP/XEraI3iY5OlNMgkNMrO', 1, NULL, 1, '2026-02-25 13:40:42', '2026-02-25 13:42:00', NULL, NULL, NULL, 3, NULL, 7, NULL, NULL),
(24, 'BAPARAPE Adam', 'adam@gmail.com', '$2y$12$LjADoda76SyXbhUTCEt6yegqIzthFhNCq4O37tAk/6UBHStkaB8qC', 0, NULL, 1, '2026-02-25 14:17:17', '2026-02-25 14:17:17', NULL, NULL, NULL, 2, 16, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `zones`
--

CREATE TABLE `zones` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `zones`
--

INSERT INTO `zones` (`id`, `name`, `city`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Cotonou Centre', 'Cotonou', NULL, 1, '2026-02-23 10:34:41', '2026-02-23 10:34:41'),
(2, 'Cotonou Nord', 'Cotonou', NULL, 1, '2026-02-23 10:34:41', '2026-02-23 10:34:41'),
(3, 'Cotonou Sud', 'Cotonou', NULL, 1, '2026-02-23 10:34:41', '2026-02-23 10:34:41'),
(4, 'Abomey-Calavi', 'Abomey-Calavi', NULL, 1, '2026-02-23 10:34:41', '2026-02-23 10:34:41'),
(5, 'Porto-Novo', 'Porto-Novo', NULL, 1, '2026-02-23 10:34:42', '2026-02-23 10:34:42'),
(6, 'Ouidah', 'Ouidah', NULL, 1, '2026-02-23 10:34:42', '2026-02-23 10:34:42'),
(7, 'Parakou', 'Parakou', NULL, 1, '2026-02-23 10:34:42', '2026-02-23 10:34:42');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Index pour la table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Index pour la table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clients_email_unique` (`email`);

--
-- Index pour la table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `demandes`
--
ALTER TABLE `demandes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `demandes_codedemande_unique` (`codeDemande`),
  ADD KEY `demandes_id_client_foreign` (`id_client`),
  ADD KEY `demandes_id_depanneur_foreign` (`id_depanneur`),
  ADD KEY `demandes_id_zone_index` (`id_zone`);

--
-- Index pour la table `depanneurs`
--
ALTER TABLE `depanneurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `depanneurs_ifu_unique` (`IFU`),
  ADD UNIQUE KEY `depanneurs_email_unique` (`email`);

--
-- Index pour la table `depanneur_zones`
--
ALTER TABLE `depanneur_zones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `depanneur_zones_id_depanneur_id_zone_unique` (`id_depanneur`,`id_zone`),
  ADD KEY `depanneur_zones_id_zone_foreign` (`id_zone`);

--
-- Index pour la table `factures`
--
ALTER TABLE `factures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `factures_transactionid_unique` (`transactionId`),
  ADD KEY `factures_id_intervention_foreign` (`id_intervention`);

--
-- Index pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Index pour la table `interventions`
--
ALTER TABLE `interventions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `interventions_id_demande_foreign` (`id_demande`),
  ADD KEY `interventions_id_depanneur_foreign` (`id_depanneur`);

--
-- Index pour la table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Index pour la table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_id_client_foreign` (`id_client`),
  ADD KEY `notifications_id_demande_foreign` (`id_demande`),
  ADD KEY `notifications_id_depanneur_foreign` (`id_depanneur`);

--
-- Index pour la table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Index pour la table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `services_id_demande_foreign` (`id_demande`),
  ADD KEY `services_id_depanneur_foreign` (`id_depanneur`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Index pour la table `social_accounts`
--
ALTER TABLE `social_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `social_provider_unique` (`provider_name`,`provider_id`),
  ADD KEY `social_accounts_user_id_foreign` (`user_id`),
  ADD KEY `social_email_index` (`provider_email`);

--
-- Index pour la table `type_comptes`
--
ALTER TABLE `type_comptes`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `utilisateurs_email_unique` (`email`),
  ADD KEY `utilisateurs_id_type_compte_foreign` (`id_type_compte`),
  ADD KEY `utilisateurs_id_client_foreign` (`id_client`),
  ADD KEY `utilisateurs_id_depanneur_foreign` (`id_depanneur`);

--
-- Index pour la table `zones`
--
ALTER TABLE `zones`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT pour la table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `demandes`
--
ALTER TABLE `demandes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT pour la table `depanneurs`
--
ALTER TABLE `depanneurs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `depanneur_zones`
--
ALTER TABLE `depanneur_zones`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT pour la table `factures`
--
ALTER TABLE `factures`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `interventions`
--
ALTER TABLE `interventions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT pour la table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT pour la table `services`
--
ALTER TABLE `services`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `social_accounts`
--
ALTER TABLE `social_accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `type_comptes`
--
ALTER TABLE `type_comptes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT pour la table `zones`
--
ALTER TABLE `zones`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `demandes`
--
ALTER TABLE `demandes`
  ADD CONSTRAINT `demandes_id_client_foreign` FOREIGN KEY (`id_client`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `demandes_id_depanneur_foreign` FOREIGN KEY (`id_depanneur`) REFERENCES `depanneurs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `demandes_id_zone_foreign` FOREIGN KEY (`id_zone`) REFERENCES `zones` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `depanneur_zones`
--
ALTER TABLE `depanneur_zones`
  ADD CONSTRAINT `depanneur_zones_id_depanneur_foreign` FOREIGN KEY (`id_depanneur`) REFERENCES `depanneurs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `depanneur_zones_id_zone_foreign` FOREIGN KEY (`id_zone`) REFERENCES `zones` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `factures`
--
ALTER TABLE `factures`
  ADD CONSTRAINT `factures_id_intervention_foreign` FOREIGN KEY (`id_intervention`) REFERENCES `interventions` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `interventions`
--
ALTER TABLE `interventions`
  ADD CONSTRAINT `interventions_id_demande_foreign` FOREIGN KEY (`id_demande`) REFERENCES `demandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `interventions_id_depanneur_foreign` FOREIGN KEY (`id_depanneur`) REFERENCES `depanneurs` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_id_client_foreign` FOREIGN KEY (`id_client`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_id_demande_foreign` FOREIGN KEY (`id_demande`) REFERENCES `demandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_id_depanneur_foreign` FOREIGN KEY (`id_depanneur`) REFERENCES `depanneurs` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_id_demande_foreign` FOREIGN KEY (`id_demande`) REFERENCES `demandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `services_id_depanneur_foreign` FOREIGN KEY (`id_depanneur`) REFERENCES `depanneurs` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `social_accounts`
--
ALTER TABLE `social_accounts`
  ADD CONSTRAINT `social_accounts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD CONSTRAINT `utilisateurs_id_client_foreign` FOREIGN KEY (`id_client`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `utilisateurs_id_depanneur_foreign` FOREIGN KEY (`id_depanneur`) REFERENCES `depanneurs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `utilisateurs_id_type_compte_foreign` FOREIGN KEY (`id_type_compte`) REFERENCES `type_comptes` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
