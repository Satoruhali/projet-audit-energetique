const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const {
  construireCriteres, criteresCouvertPar, selectionSetCover,
  calculerSeuilMinimal, completerJusquaSeuil, logements, nbEtages
} = require('./exemple-set-cover');

describe('construireCriteres', () => {
  it('doit contenir toutes les typologies', () => {
    const c = construireCriteres(logements, nbEtages);
    for (const l of logements) assert.ok(c.has(`typo:${l.typologie}`), `manque typo:${l.typologie}`);
  });

  it('doit contenir tous les planchers bas', () => {
    const c = construireCriteres(logements, nbEtages);
    for (const l of logements) assert.ok(c.has(`pb:${l.plancher_bas}`), `manque pb:${l.plancher_bas}`);
  });

  it('doit contenir tous les planchers haut', () => {
    const c = construireCriteres(logements, nbEtages);
    for (const l of logements) assert.ok(c.has(`ph:${l.plancher_haut}`), `manque ph:${l.plancher_haut}`);
  });

  it('doit contenir le critère étage intermédiaire si nbEtages > 2', () => {
    const c = construireCriteres(logements, 3);
    assert.ok(c.has('etage:intermediaire'));
  });

  it('ne doit PAS contenir étage intermédiaire si nbEtages <= 2', () => {
    const c = construireCriteres(logements, 2);
    assert.ok(!c.has('etage:intermediaire'));
  });

  it('ne doit pas avoir de doublons (Set)', () => {
    const c = construireCriteres(logements, nbEtages);
    assert.equal(c.size, [...c].length);
  });
});

describe('criteresCouvertPar', () => {
  it('un logement RDC ne couvre pas etage:intermediaire', () => {
    const c = criteresCouvertPar(logements[0], nbEtages);
    assert.ok(!c.has('etage:intermediaire'));
  });

  it('un logement au dernier étage (etage === nbEtages-1) ne couvre pas etage:intermediaire', () => {
    const c = criteresCouvertPar({ id: 'X', etage: 4, typologie: 'T1', plancher_bas: 'terre-plein', plancher_haut: 'combles' }, 5);
    assert.ok(!c.has('etage:intermediaire'));
  });

  it('un logement intermediaire couvre etage:intermediaire', () => {
    const c = criteresCouvertPar({ id: 'X', etage: 2, typologie: 'T3', plancher_bas: 'terre-plein', plancher_haut: 'combles' }, 5);
    assert.ok(c.has('etage:intermediaire'));
  });

  it('couvre toujours la typologie, le pb et le ph', () => {
    const l = logements[0];
    const c = criteresCouvertPar(l, nbEtages);
    assert.ok(c.has(`typo:${l.typologie}`));
    assert.ok(c.has(`pb:${l.plancher_bas}`));
    assert.ok(c.has(`ph:${l.plancher_haut}`));
  });
});

describe('selectionSetCover', () => {
  it('doit retourner une sélection non vide', () => {
    const r = selectionSetCover(logements, nbEtages);
    assert.ok(r.selectionnes.length > 0);
  });

  it('doit couvrir TOUS les critères avec les données par défaut', () => {
    const r = selectionSetCover(logements, nbEtages);
    assert.equal(r.ilRestait.length, 0, `Critères non couverts : ${r.ilRestait.join(', ')}`);
  });

  it('ne doit pas sélectionner de doublons', () => {
    const r = selectionSetCover(logements, nbEtages);
    const ids = r.selectionnes;
    assert.equal(ids.length, new Set(ids).size);
  });

  it('doit couvrir tous les critères même avec un seul logement qui tous les couvre', () => {
    const l = [{ id: 'X', etage: 1, typologie: 'T1', plancher_bas: 'terre-plein', plancher_haut: 'combles' }];
    const r = selectionSetCover(l, 3);
    assert.equal(r.ilRestait.length, 0);
    assert.deepEqual(r.selectionnes, ['X']);
  });

  it('retourne un résultat incomplet si aucun logement ne peut tout couvrir (cas extrême)', () => {
    const l = [{ id: 'X', etage: 0, typologie: 'T1', plancher_bas: 'terre-plein', plancher_haut: 'combles' }];
    const r = selectionSetCover(l, 5);
    assert.ok(r.ilRestait.length > 0);
  });

  it('retourne sélection vide si tableau vide', () => {
    const r = selectionSetCover([], 3);
    assert.equal(r.selectionnes.length, 0);
  });
});

describe('calculerSeuilMinimal', () => {
  it('retourne 0 si < 31 logements', () => assert.equal(calculerSeuilMinimal(30), 0));
  it('retourne 0 si 0 logement', () => assert.equal(calculerSeuilMinimal(0), 0));
  it('retourne ceil(n*0.10) si entre 31 et 100', () => {
    assert.equal(calculerSeuilMinimal(31), 4);   // ceil(31*0.10)=ceil(3.1)=4
    assert.equal(calculerSeuilMinimal(50), 5);
    assert.equal(calculerSeuilMinimal(100), 10);
  });
  it('retourne max(10, ceil(n*0.05)) si > 100', () => {
    assert.equal(calculerSeuilMinimal(101), 10);  // ceil(5.05)=6, max(10,6)=10
    assert.equal(calculerSeuilMinimal(200), 10);
    assert.equal(calculerSeuilMinimal(300), 15);
  });
});

describe('completerJusquaSeuil', () => {
  it('ne modifie rien si déjà au-dessus du seuil', () => {
    const sel = [logements[0], logements[1]];
    const r = completerJusquaSeuil(sel, logements, 2, nbEtages);
    assert.equal(r.length, 2);
  });

  it('complète jusqu au seuil si besoin', () => {
    const r = completerJusquaSeuil([logements[0]], logements, 3, nbEtages);
    assert.equal(r.length, 3);
  });

  it('ne dépasse pas le seuil', () => {
    const r = completerJusquaSeuil([logements[0]], logements, 5, nbEtages);
    assert.equal(r.length, 5);
  });
});
