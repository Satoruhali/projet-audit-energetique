function construireCriteres(logements) {
  const criteres = new Set();

  const typologies = new Set(logements.map(l => l.typologie).filter(v => v != null));
  for (const t of typologies) criteres.add(`typo:${t}`);

  const planchersBas = new Set(logements.map(l => l.plancher_bas).filter(v => v != null));
  for (const p of planchersBas) criteres.add(`pb:${p}`);

  const planchersHaut = new Set(logements.map(l => l.plancher_haut).filter(v => v != null));
  for (const p of planchersHaut) criteres.add(`ph:${p}`);

  const positions = new Set(logements.map(l => l.position).filter(v => v != null));
  for (const p of positions) criteres.add(`pos:${p}`);

  return criteres;
}

function criteresCouvertPar(logement) {
  const couverts = new Set();
  if (logement.typologie != null) couverts.add(`typo:${logement.typologie}`);
  if (logement.plancher_bas != null) couverts.add(`pb:${logement.plancher_bas}`);
  if (logement.plancher_haut != null) couverts.add(`ph:${logement.plancher_haut}`);
  if (logement.position != null) couverts.add(`pos:${logement.position}`);
  return couverts;
}

function selectionSetCover(logements) {
  const criteresRestants = construireCriteres(logements);
  const selection = [];

  const avecCriteres = logements.map(l => ({
    id: l.id,
    etage: l.etage,
    typologie: l.typologie,
    plancher_bas: l.plancher_bas,
    plancher_haut: l.plancher_haut,
    position: l.position,
    couverts: criteresCouvertPar(l)
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

  const selectionIds = new Set(selection.map(l => l.id.toString()));
  const exclus = logements.filter(l => !selectionIds.has(l.id.toString()));
  exclus.sort((a, b) => a.etage - b.etage);

  const result = [...selection];
  for (const logement of exclus) {
    if (result.length >= seuil) break;
    result.push(logement);
  }
  return result;
}

function lancerSelection(logements) {
  const logementsData = logements.map(l => l.toJSON ? l.toJSON() : l);

  const resultat = selectionSetCover(logementsData);

  const selectionComplete = completerJusquaSeuil(
    resultat.selectionnes,
    logementsData,
    calculerSeuilMinimal(logementsData.length)
  );

  return {
    success: resultat.ilRestait.length === 0,
    selectionnes: selectionComplete.map(l => l.id),
    couverture: {
      typologies: [...new Set(selectionComplete.map(l => l.typologie).filter(v => v != null))],
      planchersBas: [...new Set(selectionComplete.map(l => l.plancher_bas).filter(v => v != null))],
      planchersHaut: [...new Set(selectionComplete.map(l => l.plancher_haut).filter(v => v != null))],
      positions: [...new Set(selectionComplete.map(l => l.position).filter(v => v != null))]
    },
    seuil: { requis: calculerSeuilMinimal(logementsData.length), obtenu: selectionComplete.length },
    criteresManquants: resultat.ilRestait
  };
}

module.exports = { lancerSelection };
