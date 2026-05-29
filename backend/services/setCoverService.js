function construireCriteres(logements, nbEtages) {
  const criteres = new Set();

  const typologies = new Set(logements.map(l => l.typologie));
  for (const t of typologies) criteres.add(`typo:${t}`);

  const planchersBas = new Set(logements.map(l => l.plancher_bas));
  for (const p of planchersBas) criteres.add(`pb:${p}`);

  const planchersHaut = new Set(logements.map(l => l.plancher_haut));
  for (const p of planchersHaut) criteres.add(`ph:${p}`);

  if (nbEtages > 2) criteres.add('etage:intermediaire');

  return criteres;
}

function criteresCouvertPar(logement, nbEtages) {
  const couverts = new Set();
  couverts.add(`typo:${logement.typologie}`);
  couverts.add(`pb:${logement.plancher_bas}`);
  couverts.add(`ph:${logement.plancher_haut}`);
  const estRdc = logement.etage === 0;
  const estDernier = logement.etage === nbEtages - 1;
  if (!estRdc && !estDernier) couverts.add('etage:intermediaire');
  return couverts;
}

function selectionSetCover(logements, nbEtages) {
  const criteresRestants = construireCriteres(logements, nbEtages);
  const selection = [];

  const avecCriteres = logements.map(l => ({
    _id: l._id,
    etage: l.etage,
    typologie: l.typologie,
    plancher_bas: l.plancher_bas,
    plancher_haut: l.plancher_haut,
    couverts: criteresCouvertPar(l, nbEtages)
  }));

  while (criteresRestants.size > 0) {
    let meilleur = null;
    let meilleurCompte = 0;

    for (const logement of avecCriteres) {
      if (selection.includes(logement)) continue;
      let compte = 0;
      for (const c of logement.couverts) {
        if (criteresRestants.has(c)) compte++;
      }
      if (compte > meilleurCompte) {
        meilleurCompte = compte;
        meilleur = logement;
      }
    }

    if (!meilleur || meilleurCompte === 0) break;

    selection.push(meilleur);
    for (const c of meilleur.couverts) {
      criteresRestants.delete(c);
    }
  }

  return {
    selectionnes: selection,
    ilRestait: [...criteresRestants]
  };
}

function calculerSeuilMinimal(nbLogements) {
  if (nbLogements < 31) return 0;
  if (nbLogements <= 100) return Math.ceil(nbLogements * 0.10);
  return Math.max(10, Math.ceil(nbLogements * 0.05));
}

function completerJusquaSeuil(selection, logements, seuil) {
  if (selection.length >= seuil) return selection;

  const selectionIds = new Set(selection.map(l => l._id.toString()));
  const exclus = logements.filter(l => !selectionIds.has(l._id.toString()));
  exclus.sort((a, b) => a.etage - b.etage);

  const result = [...selection];
  for (const logement of exclus) {
    if (result.length >= seuil) break;
    result.push(logement);
  }
  return result;
}

function lancerSelection(logements, nbEtages) {
  const logementsData = logements.map(l => l.toObject ? l.toObject() : l);

  const resultat = selectionSetCover(logementsData, nbEtages);

  const selectionComplete = completerJusquaSeuil(
    resultat.selectionnes,
    logementsData,
    calculerSeuilMinimal(logementsData.length)
  );

  return {
    success: resultat.ilRestait.length === 0,
    selectionnes: selectionComplete.map(l => l._id),
    couverture: {
      typologies: [...new Set(selectionComplete.map(l => l.typologie))],
      planchersBas: [...new Set(selectionComplete.map(l => l.plancher_bas))],
      planchersHaut: [...new Set(selectionComplete.map(l => l.plancher_haut))],
      intermediaire: selectionComplete.some(l => {
        const estRdc = l.etage === 0;
        const estDernier = l.etage === nbEtages - 1;
        return !estRdc && !estDernier;
      })
    },
    seuil: { requis: calculerSeuilMinimal(logementsData.length), obtenu: selectionComplete.length },
    criteresManquants: resultat.ilRestait
  };
}

module.exports = { lancerSelection };
