/**
 * Exemple pédagogique : Set Cover appliqué à l'échantillonnage DPE (RG11-RG15)
 *
 * Le problème : on a N logements. Chaque logement peut "couvrir" plusieurs
 * critères réglementaires (typologie, plancher bas, plancher haut, étage).
 * Objectif : trouver le PLUS PETIT ensemble de logements qui couvre TOUS
 * les critères obligatoires.
 *
 * C'est le "set cover problem" (problème de couverture par ensembles).
 */

// ============================================================
// 1. DONNÉES D'EXEMPLE
// ============================================================

const logements = [
  { id: 'A1', etage: 0,  typologie: 'T1', plancher_bas: 'terre-plein',  plancher_haut: 'combles-perdus' },
  { id: 'A2', etage: 0,  typologie: 'T2', plancher_bas: 'terre-plein',  plancher_haut: 'combles-perdus' },
  { id: 'B1', etage: 1,  typologie: 'T2', plancher_bas: 'vide-sanitaire', plancher_haut: 'combles-perdus' },
  { id: 'B2', etage: 1,  typologie: 'T3', plancher_bas: 'vide-sanitaire', plancher_haut: 'toiture-terrasse' },
  { id: 'C1', etage: 2,  typologie: 'T3', plancher_bas: 'sur-local',     plancher_haut: 'toiture-terrasse' },
  { id: 'C2', etage: 2,  typologie: 'T4', plancher_bas: 'sur-local',     plancher_haut: 'combles-amenages' },
  { id: 'D1', etage: 3,  typologie: 'T4', plancher_bas: 'garage',        plancher_haut: 'combles-amenages' },
  { id: 'D2', etage: 3,  typologie: 'T5', plancher_bas: 'garage',        plancher_haut: 'exterieur' },
  { id: 'E1', etage: 4,  typologie: 'T5', plancher_bas: 'autre',         plancher_haut: 'exterieur' },
  { id: 'E2', etage: 4,  typologie: 'T6', plancher_bas: 'autre',         plancher_haut: 'combles-perdus' },
];

const nbEtages = 5; // étages 0 à 4 → RDC = 0, dernier = 4

// ============================================================
// 2. CONSTRUCTION DES CRITÈRES OBLIGATOIRES (RG11-RG14)
// ============================================================

function construireCriteres(logements, nbEtages) {
  const criteres = new Set();

  // RG11 : 1 logement par typologie présente
  const typologies = new Set(logements.map(l => l.typologie));
  for (const t of typologies) criteres.add(`typo:${t}`);

  // RG12 : 1 logement par type de plancher bas présent
  const planchersBas = new Set(logements.map(l => l.plancher_bas));
  for (const p of planchersBas) criteres.add(`pb:${p}`);

  // RG13 : 1 logement par type de plancher haut présent
  const planchersHaut = new Set(logements.map(l => l.plancher_haut));
  for (const p of planchersHaut) criteres.add(`ph:${p}`);

  // RG14 : 1 logement en étage intermédiaire (si immeuble > 2 niveaux)
  if (nbEtages > 2) criteres.add('etage:intermediaire');

  return criteres;
}

// ============================================================
// 3. POUR CHAQUE LOGEMENT, QUELS CRITÈRES COUVRE-T-IL ?
// ============================================================

function criteresCouvertPar(logement, nbEtages) {
  const couverts = new Set();
  couverts.add(`typo:${logement.typologie}`);
  couverts.add(`pb:${logement.plancher_bas}`);
  couverts.add(`ph:${logement.plancher_haut}`);
  const estRdc = logement.etage === 0;
  const estDernier = logement.etage === nbEtages;
  if (!estRdc && !estDernier) couverts.add('etage:intermediaire');
  return couverts;
}

// ============================================================
// 4. ALGORITHME SET COVER (glouton, approché)
// ============================================================
//
// Principe : à chaque étape, on choisit le logement qui couvre
// le PLUS de critères ENCORE NON COUVERTS.
// Ce n'est pas optimal à 100% (le set cover est NP-difficile),
// mais l'approche gloutonne donne une solution proche de l'optimum.
//
// Pourquoi "glouton" ? Parce qu'il fait le meilleur choix local
// sans anticiper les conséquences futures.
//
// EXEMPLE CONCRET AVEC NOS DONNÉES :
//
// Critères à couvrir : {typo:T1, typo:T2, typo:T3, typo:T4, typo:T5, typo:T6,
//                        pb:terre-plein, pb:vide-sanitaire, pb:sur-local, pb:garage, pb:autre,
//                        ph:combles-perdus, ph:toiture-terrasse, ph:combles-amenages, ph:exterieur,
//                        etage:intermediaire}
//
// Itération 1 : quel logement couvre le plus de critères ?
//   - B2 (T3, vide-sanitaire, toiture-terrasse, ET intermediaire) → 4 critères
//   B2 est choisi, on retire ses critères de l'ensemble.
//
// Itération 2 : idem parmi les critères restants
//   - ... et ainsi de suite jusqu'à tout couvrir, ou épuiser les logements.

function selectionSetCover(logements, nbEtages) {
  const criteresRestants = construireCriteres(logements, nbEtages);
  const selection = [];
  const disponibles = [...logements];

  // Prétendre que chaque logement sait quels critères il couvre
  const avecCriteres = disponibles.map(l => ({
    ...l,
    couverts: criteresCouvertPar(l, nbEtages)
  }));

  while (criteresRestants.size > 0) {
    let meilleur = null;
    let meilleurCompte = 0;

    for (const logement of avecCriteres) {
      if (selection.includes(logement)) continue;
      // Compter combien de critères ENCORE RESTANTS ce logement couvre
      let compte = 0;
      for (const c of logement.couverts) {
        if (criteresRestants.has(c)) compte++;
      }
      if (compte > meilleurCompte) {
        meilleurCompte = compte;
        meilleur = logement;
      }
    }

    // Si aucun logement ne couvre de nouveaux critères → stop (incomplet)
    if (!meilleur || meilleurCompte === 0) break;

    selection.push(meilleur);
    // Retirer les critères désormais couverts
    for (const c of meilleur.couverts) {
      criteresRestants.delete(c);
    }
  }

  return {
    selectionnes: selection.map(l => l.id),
    ilRestait: [...criteresRestants]
  };
}

// ============================================================
// 5. SEUIL MINIMAL RG15
// ============================================================

function calculerSeuilMinimal(nbLogements) {
  // Arrêté du 31 mars 2021 modifié — DPE collectif
  if (nbLogements < 31) return 0; // en dessous, pas de seuil quantitatif
  if (nbLogements <= 100) return Math.ceil(nbLogements * 0.10);
  return Math.max(10, Math.ceil(nbLogements * 0.05));
}

function completerJusquaSeuil(selection, logements, seuil, nbEtages) {
  if (selection.length >= seuil) return selection;

  const exclus = logements.filter(l => !selection.includes(l));
  // Trier par étage pour favoriser la diversité (cohérent avec RG3)
  exclus.sort((a, b) => a.etage - b.etage);

  for (const logement of exclus) {
    if (selection.length >= seuil) break;
    selection.push(logement);
  }
  return selection;
}

// ============================================================
// 6. EXÉCUTION
// ============================================================

console.log('=== ÉTAPE 1 : Critères obligatoires (RG11-RG14) ===');
const criteres = construireCriteres(logements, nbEtages);
console.log(`Il faut couvrir ${criteres.size} critères :`);
for (const c of [...criteres].sort()) console.log(`  - ${c}`);

console.log('\n=== ÉTAPE 2 : Quel logement couvre quoi ? ===');
for (const l of logements) {
  const couverts = criteresCouvertPar(l, nbEtages);
  console.log(`  ${l.id} (étage ${l.etage}, ${l.typologie}, ${l.plancher_bas}, ${l.plancher_haut}) → ${[...couverts].join(', ')}`);
}

console.log('\n=== ÉTAPE 3 : Set cover glouton ===');
const resultat = selectionSetCover(logements, nbEtages);
console.log(`Logements sélectionnés : ${resultat.selectionnes.join(', ')}`);

if (resultat.ilRestait.length > 0) {
  console.log(`Critères NON couverts : ${resultat.ilRestait.join(', ')}`);
  console.log('→ ÉCHANTILLONNAGE INCOMPLET');
} else {
  console.log('→ ÉCHANTILLONNAGE COMPLET');
}

console.log('\n=== ÉTAPE 4 : Vérification seuil minimal RG15 ===');
const seuil = calculerSeuilMinimal(logements.length);
console.log(`${logements.length} logements → seuil = ${seuil} visites minimum`);
const selectionComplete = completerJusquaSeuil(
  resultat.selectionnes.map(id => logements.find(l => l.id === id)),
  logements,
  seuil,
  nbEtages
);
console.log(`Sélection finale (${selectionComplete.length} logements) : ${selectionComplete.map(l => l.id).join(', ')}`);

// ============================================================
// 7. RÉSULTAT STRUCTURÉ (pour l'API)
// ============================================================

console.log('\n=== RÉSULTAT FINAL ===');
console.log(JSON.stringify({
  success: resultat.ilRestait.length === 0,
  selectionnes: selectionComplete.map(l => l.id),
  couverture: {
    typologies: [...new Set(selectionComplete.map(l => l.typologie))],
    planchersBas: [...new Set(selectionComplete.map(l => l.plancher_bas))],
    planchersHaut: [...new Set(selectionComplete.map(l => l.plancher_haut))],
    intermediaire: selectionComplete.some(l => {
      const estRdc = l.etage === 0;
      const estDernier = l.etage === nbEtages;
      return !estRdc && !estDernier;
    })
  },
  seuil: { requis: seuil, obtenu: selectionComplete.length },
  criteresManquants: resultat.ilRestait
}, null, 2));
