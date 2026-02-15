-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : dim. 15 fév. 2026 à 18:07
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

--
-- Déchargement des données de la table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-4cf3e49806769733e906964c91f5b814', 'i:1;', 1770735364),
('laravel-cache-4cf3e49806769733e906964c91f5b814:timer', 'i:1770735364;', 1770735364),
('laravel-cache-a92385e26d055c8da08b6ed073a739b9', 'i:1;', 1770797988),
('laravel-cache-a92385e26d055c8da08b6ed073a739b9:timer', 'i:1770797988;', 1770797988),
('laravel-cache-c6be2cf7c13d9a527ee2fe401bbae3c7', 'i:2;', 1770913041),
('laravel-cache-c6be2cf7c13d9a527ee2fe401bbae3c7:timer', 'i:1770913041;', 1770913041),
('laravel-cache-cea1272173eec7ba9ba8f25accb4a9bc', 'i:1;', 1770795433),
('laravel-cache-cea1272173eec7ba9ba8f25accb4a9bc:timer', 'i:1770795433;', 1770795433),
('laravel-cache-hachiroubaparape@gmail.com|127.0.0.1', 'i:1;', 1770797989),
('laravel-cache-hachiroubaparape@gmail.com|127.0.0.1:timer', 'i:1770797988;', 1770797989),
('laravel-cache-moutia@gmail.com|127.0.0.1', 'i:1;', 1770735365),
('laravel-cache-moutia@gmail.com|127.0.0.1:timer', 'i:1770735364;', 1770735364),
('laravel-cache-nafirou@gmail.com|127.0.0.1', 'i:1;', 1770795434),
('laravel-cache-nafirou@gmail.com|127.0.0.1:timer', 'i:1770795434;', 1770795434);

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
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id`, `fullName`, `email`, `phone`, `createdAt`, `updatedAt`) VALUES
(1, 'BAPARAPE Hachirou', 'hachiroubaparape@gmail.com', '0169162107', '2026-02-10 09:53:15', '2026-02-10 09:53:15'),
(14, 'BAPARAPE moutia', 'moutia@gmail.com', '0169162107', '2026-02-10 14:58:10', '2026-02-10 14:58:10'),
(17, 'BAPARAPE chawal', 'chawal@gmail.com', '0169162107', '2026-02-12 11:11:35', '2026-02-12 11:11:35'),
(19, 'AMADOU Kadi', 'kadi@gmail.coom', '0140419296', '2026-02-12 16:37:05', '2026-02-12 16:37:05'),
(20, 'Adam lolo', 'lolo@gmail.com', '0169162107', '2026-02-13 14:32:44', '2026-02-13 14:32:44'),
(21, 'toni BIO', 'toni@gmail.com', '0169162107', '2026-02-15 14:39:07', '2026-02-15 14:39:07'),
(22, 'geo', 'g@gmail.com', '0188', '2026-02-15 14:54:57', '2026-02-15 14:54:57');

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
  `status` enum('en_attente','acceptee','en_cours','terminee','annulee') NOT NULL DEFAULT 'en_attente',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `acceptedAt` timestamp NULL DEFAULT NULL,
  `completedAt` timestamp NULL DEFAULT NULL,
  `id_client` bigint(20) UNSIGNED NOT NULL,
  `id_depanneur` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `type_vehicule` enum('voiture','moto','les_deux') NOT NULL DEFAULT 'les_deux',
  `localisation_actuelle` varchar(100) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `depanneurs`
--

INSERT INTO `depanneurs` (`id`, `promoteur_name`, `etablissement_name`, `IFU`, `email`, `phone`, `status`, `isActive`, `type_vehicule`, `localisation_actuelle`, `createdAt`, `updatedAt`) VALUES
(2, 'hachirou', 'ETS', '1020451687', 'hachiroubaparape@gmail.com', '0169162107', 'disponible', 1, 'voiture', '6.4349, 2.3511', '2026-02-10 08:56:25', '2026-02-10 08:56:25'),
(8, 'houzerou', 'PARAPE', '457891245', 'houzerou@gmail.com', '0169162107', 'disponible', 0, 'moto', '6.3701, 2.4838', '2026-02-11 14:54:01', '2026-02-13 10:00:29'),
(11, 'Igor', 'DORO', '1456872395', 'igor@gmail.com', '0164357436', 'disponible', 1, 'moto', '6.3618, 2.3977', '2026-02-13 10:14:48', '2026-02-13 10:25:54');

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

CREATE TABLE `failed_jobs' (
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
(5, '2026_02_02_092141_create_type_comptes_table', 2),
(6, '2026_02_02_092142_create_clients_table', 2),
(7, '2026_02_02_092142_create_zones_table', 2),
(8, '2026_02_02_092143_create_depanneurs_table', 2),
(9, '2026_02_02_092143_create_utilisateur_table', 2),
(10, '2026_02_02_092144_create_demandes_table', 2),
(11, '2026_02_02_092144_create_depanneur_zones_table', 2),
(12, '2026_02_02_092144_create_interventions_table', 2),
(13, '2026_02_02_092144_create_services_table', 2),
(14, '2026_02_02_092145_create_factures_table', 2),
(15, '2026_02_02_092145_create_notifications_table', 2),
(16, '2026_02_02_092146_add_vehicle_type_to_depanneurs', 2),
(17, '2026_02_02_092147_add_vehicle_type_to_demandes', 2),
(18, '2026_02_02_092148_add_titre_to_notifications', 3),
(19, '2026_02_10_090000_rename_boolean_to_email_verified_in_utilisateurs', 4),
(20, '2026_02_11_140751_create_social_accounts_table', 5);

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `message` text NOT NULL,
  `titre` varchar(255) DEFAULT NULL,
  `type` enum('nouvelle_demande','demande_acceptee','depanneur_en_route','intervention_terminee','paiement_recu','alerte_systeme') NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_client` bigint(20) UNSIGNED DEFAULT NULL,
  `id_demande` bigint(20) UNSIGNED DEFAULT NULL,
  `id_depanneur` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
('Dw2xqBFQzy2x60iu6a81tIDb9vLBqK5qABZYY7Cr', NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiWlVLcThLaVBwSnVMWUI5RjU0SVJDbHRiQ0M3TkNoRGdldXpPd0JjTCI7czoxNToianVzdF9sb2dnZWRfb3V0IjtiOjE7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fX0=', 1771174009);

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
(1, 'Admin', '2026-02-09 17:18:42', '2026-02-09 17:18:42'),
(2, 'Client', '2026-02-09 17:18:42', '2026-02-09 17:18:42'),
(3, 'Depanneur', '2026-02-09 17:18:42', '2026-02-09 17:18:42');

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
(1, 'Test User', 'test@example.com', '2026-02-09 16:28:09', '$2y$12$LXap1e4bCFBrrSdHJlYZNeTWFkS2uDiM4qYLruEONHoaEp56zkpVS', NULL, NULL, NULL, 'UaOWLuLMu5', '2026-02-09 16:28:10', '2026-02-09 16:28:10');

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
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_By` varchar(255) DEFAULT NULL,
  `updatedBy` varchar(255) DEFAULT NULL,
  `DeleteedBy` varchar(255) DEFAULT NULL,
  `id_type_compte` bigint(20) UNSIGNED NOT NULL,
  `id_client` bigint(20) UNSIGNED DEFAULT NULL,
  `id_depanneur` bigint(20) UNSIGNED DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `fullName`, `email`, `password`, `email_verified`, `email_verified_at`, `createdAt`, `updatedAt`, `created_By`, `updatedBy`, `DeleteedBy`, `id_type_compte`, `id_client`, `id_depanneur`, `remember_token`) VALUES
(1, 'BAPARAPE Hachirou', 'hachiroubaparape@gmail.com', '$2y$12$g6Kht.rs5QbMfHHseUypsOE87klvdR6YJcM5J3AD07WLhvdpf7BEC', 0, NULL, '2026-02-10 08:53:17', '2026-02-10 08:53:17', NULL, NULL, NULL, 2, 1, NULL, NULL),
(18, 'BAPARAPE houzerou', 'houzerou@gmail.com', '$2y$12$rftHd6kq65Cr9eA535TfN.HFZ3zkhn8NkYX74xjeEzwk2GCZX.ip.', 1, NULL, '2026-02-11 13:54:02', '2026-02-11 14:55:10', NULL, NULL, NULL, 3, NULL, 8, 'zPY0q18yNPXT7LBUA0MJzLrUd0YarrGxOM6l3drzVEoLPXhzLOQbAe8XuI01'),
(20, 'BAPARAPE chawal', 'chawal@gmail.com', '$2y$12$33xL2.UQt8M7vsAGSAiuzuCATpaHsUrJpWPCXtipyv9Q0Y9ANoxQ6', 0, NULL, '2026-02-12 10:11:36', '2026-02-12 10:11:36', NULL, NULL, NULL, 2, 17, NULL, NULL),
(24, 'AMADOU Kadi', 'kadi@gmail.coom', '$2y$12$NZAYGqPpBvGz5zXHxWzVrewM1AJlte6uSucAAXAo2NV0h.H1FPaKO', 0, NULL, '2026-02-12 15:37:06', '2026-02-12 15:37:06', NULL, NULL, NULL, 2, 19, NULL, NULL),
(25, 'DEBGE Igor', 'igor@gmail.com', '$2y$12$pNLcz.Xa24iqo0l93ZhV1.5BO5IJ7xJvMrSuXLNwZIyUH3wwxHz1m', 1, NULL, '2026-02-13 09:14:49', '2026-02-13 10:17:56', NULL, NULL, NULL, 3, NULL, 11, 'CLbdhDu3KxftaZWbDyzUpOT3G1HoIk0oLm7KuY2FjYZP0Ji4N4JY8eqVRLtP'),
(26, 'Adam lolo', 'lolo@gmail.com', '$2y$12$zt6/5I8bXFvAy4ssCSGx9ePQHEhYPoUIFCYRMBEvs3.KPTjycK0EG', 0, NULL, '2026-02-13 13:32:45', '2026-02-13 13:32:45', NULL, NULL, NULL, 2, 20, NULL, NULL),
(27, 'toni BIO', 'toni@gmail.com', '$2y$12$OGGIeoV29fwd/8k5bGrrG.q8p6fayxP/39bXf2OHEWNpovCrr.ytm', 0, NULL, '2026-02-15 13:39:08', '2026-02-15 13:39:08', NULL, NULL, NULL, 2, 21, NULL, NULL),
(28, 'geo', 'g@gmail.com', '$2y$12$I4q5cdEQAaCviHNo7I9DwuIpjFClLbLsvWTV.HV9aTubAE.sI2iCe', 0, NULL, '2026-02-15 13:54:58', '2026-02-15 13:54:58', NULL, NULL, NULL, 2, 22, NULL, NULL);

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
-- Index pour la table `demandes`
--
ALTER TABLE `demandes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `demandes_codedemande_unique` (`codeDemande`),
  ADD KEY `demandes_id_client_foreign` (`id_client`),
  ADD KEY `demandes_id_depanneur_foreign` (`id_depanneur`);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT pour la table `demandes`
--
ALTER TABLE `demandes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `depanneurs`
--
ALTER TABLE `depanneurs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `depanneur_zones`
--
ALTER TABLE `depanneur_zones`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

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
  ADD CONSTRAINT `demandes_id_depanneur_foreign` FOREIGN KEY (`id_depanneur`) REFERENCES `depanneurs` (`id`) ON DELETE SET NULL;

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
