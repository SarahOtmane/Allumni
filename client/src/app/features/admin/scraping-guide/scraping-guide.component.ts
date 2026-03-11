import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Guide d'Enrichissement LinkedIn</h1>
        <p class="mt-2 text-gray-600">Suivez ces étapes pour mettre à jour automatiquement les postes et expériences de vos Alumni via Apify (Version Gratuite).</p>
      </header>

      <div class="space-y-8">
        <!-- Étape 1 -->
        <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center mb-4">
            <span class="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">1</span>
            <h2 class="text-xl font-semibold text-gray-900">Exporter les URLs depuis l'application</h2>
          </div>
          <p class="text-gray-600 ml-11">
            Allez dans l'onglet <strong>Promotions</strong>, sélectionnez une année, puis cliquez sur le bouton 
            <span class="inline-flex items-center text-indigo-600 font-medium px-2 py-1 bg-indigo-50 rounded italic text-sm">
              "Export Apify"
            </span>. 
            Un fichier JSON contenant toutes les URLs LinkedIn de la promotion sera téléchargé sur votre ordinateur.
          </p>
        </section>

        <!-- Étape 2 -->
        <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center mb-4">
            <span class="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">2</span>
            <h2 class="text-xl font-semibold text-gray-900">Configuration sur Apify</h2>
          </div>
          <div class="text-gray-600 ml-11 space-y-3">
            <p>Connectez-vous à votre compte sur <a href="https://apify.com" target="_blank" class="text-indigo-600 underline">Apify.com</a>.</p>
            <p>Dans le <strong>Store</strong>, cherchez l'Actor : <code class="bg-gray-100 px-1 rounded text-pink-600 font-mono">dev_fusion/linkedin-profile-scraper</code>.</p>
            <p class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400 text-sm text-yellow-800">
              <strong>Note :</strong> Cliquez sur "Try for free" pour l'ajouter à votre console.
            </p>
          </div>
        </section>

        <!-- Étape 3 -->
        <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center mb-4">
            <span class="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">3</span>
            <h2 class="text-xl font-semibold text-gray-900">Lancer le Scraping</h2>
          </div>
          <div class="text-gray-600 ml-11 space-y-3">
            <p>Dans l'onglet <strong>Input</strong> de l'Actor sur Apify :</p>
            <ul class="list-disc ml-5 space-y-1">
              <li>Cliquez sur "Switch to JSON editor".</li>
              <li>Copiez-collez le contenu du fichier téléchargé à l'étape 1.</li>
              <li>Cliquez sur le bouton vert <strong>"Save & Start"</strong>.</li>
            </ul>
            <p class="italic text-sm">Attendez que le statut passe à "Succeeded" (cela peut prendre quelques minutes).</p>
          </div>
        </section>

        <!-- Étape 4 -->
        <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center mb-4">
            <span class="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">4</span>
            <h2 class="text-xl font-semibold text-gray-900">Télécharger les résultats</h2>
          </div>
          <p class="text-gray-600 ml-11">
            Une fois terminé, allez dans l'onglet <strong>Export</strong> (ou Dataset) sur Apify. 
            Sélectionnez le format <strong>JSON</strong> et cliquez sur <strong>Download</strong>.
          </p>
        </section>

        <!-- Étape 5 -->
        <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center mb-4">
            <span class="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">5</span>
            <h2 class="text-xl font-semibold text-gray-900">Importer et Visualiser</h2>
          </div>
          <div class="text-gray-600 ml-11 space-y-3">
            <p>Revenez sur votre application Alumni, dans la même promotion.</p>
            <p>Cliquez sur 
              <span class="inline-flex items-center text-green-600 font-medium px-2 py-1 bg-green-50 rounded italic text-sm">
                "Import Apify"
              </span> 
              et sélectionnez le fichier JSON téléchargé sur Apify.
            </p>
            <p><strong>C'est fini !</strong> Les postes sont à jour et vous pouvez cliquer sur <strong>"Détails"</strong> pour voir le parcours complet de chaque étudiant.</p>
          </div>
        </section>
      </div>

      <footer class="mt-12 text-center text-gray-400 text-sm italic">
        Cette méthode contourne les limitations de l'API gratuite d'Apify en traitant les données manuellement.
      </footer>
    </div>
  `,
})
export class ScrapingGuideComponent {}
