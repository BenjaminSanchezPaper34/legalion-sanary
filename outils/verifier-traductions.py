#!/usr/bin/env python3
"""Vérifie que translations.json couvre tous les textes français de menu.json.
À lancer après chaque modification de la carte : python3 outils/verifier-traductions.py
Affiche, par langue, les textes français sans traduction (à ajouter dans translations.json)."""
import json, os
os.chdir(os.path.join(os.path.dirname(__file__), ".."))
d = json.load(open("menu.json", encoding="utf-8"))
T = json.load(open("translations.json", encoding="utf-8"))
S = []
def add(x):
    if x and isinstance(x, str) and x not in S: S.append(x)
for s in d["sections"]:
    add(s.get("title")); add(s.get("nav_label")); add(s.get("note"))
    for i in s.get("items", []): add(i.get("description"))
    for a in s.get("addons", []): add(a.get("name")); add(a.get("description"))
    for x in s.get("subsections", []): add(x.get("title"))
    for v in (s.get("flavors") or {}).values(): add(v)
    f = s.get("formula") or {}
    add(f.get("starter"))
    for v in f.get("mains", []) + f.get("desserts", []): add(v)
    for g in s.get("groups", []):
        add(g.get("title"))
        for i in g.get("items", []):
            if not i.get("no_translate"): add(i.get("name"))
            add(i.get("description"))
for n in d.get("footer_notices", []): add(n)
for u in ["Parfums des glaces", "Parfums des sorbets", "Mentions légales", "Réalisé par"]: add(u)
ok = True
for lang, table in T.items():
    manquants = [x for x in S if x not in table]
    if manquants:
        ok = False
        print(f"[{lang}] {len(manquants)} texte(s) sans traduction :")
        for m in manquants: print("   -", m)
print("Traductions complètes." if ok else "\nAjoute ces textes dans translations.json (clé = texte français exact).")
