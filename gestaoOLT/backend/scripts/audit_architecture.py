from __future__ import annotations

import os
import re
from pathlib import Path
from typing import List

ROOT = Path("smartolt/backend/src/features")

REQUIRED_FILES = {"types.ts", "repository.ts", "service.ts"}

ALLOWED_DOMAIN_LOOSE_FILES = {".gitkeep"}

SERVICE_FUNC_PATTERN = re.compile(r"export\s+async\s+function\s+(execute[A-Z]\w*)\s*\(")
SUPABASE_PATTERN = re.compile(r"\bsupabase\b")
THROW_ERROR_PATTERN = re.compile(r"if\s*\(\s*error\s*\)\s*\{\s*throw\s+error\s*;?\s*\}", re.DOTALL)

issues: List[str] = []
warnings: List[str] = []
ok: List[str] = []


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except Exception as e:
        issues.append(f"[READ_ERROR] {path}: {e}")
        return ""


def is_feature_dir(path: Path) -> bool:
    if not path.is_dir():
        return False
    files = {p.name for p in path.iterdir() if p.is_file()}
    return REQUIRED_FILES.issubset(files)


def list_domain_dirs(root: Path) -> List[Path]:
    return [p for p in root.iterdir() if p.is_dir()]


def audit_feature_dir(feature_dir: Path) -> None:
    rel = feature_dir.as_posix()

    files = {p.name for p in feature_dir.iterdir() if p.is_file()}
    missing = REQUIRED_FILES - files
    if missing:
        issues.append(f"[MISSING_FILES] {rel}: faltando {sorted(missing)}")
        return

    types_path = feature_dir / "types.ts"
    repo_path = feature_dir / "repository.ts"
    service_path = feature_dir / "service.ts"

    repo_text = read_text(repo_path)
    service_text = read_text(service_path)
    types_text = read_text(types_path)

    if not SUPABASE_PATTERN.search(repo_text):
        warnings.append(f"[NO_SUPABASE_IN_REPOSITORY] {repo_path.as_posix()}")

    if SUPABASE_PATTERN.search(service_text):
        issues.append(f"[SUPABASE_IN_SERVICE] {service_path.as_posix()}")

    if SUPABASE_PATTERN.search(types_text):
        issues.append(f"[SUPABASE_IN_TYPES] {types_path.as_posix()}")

    if "from './types'" in types_text or 'from "./types"' in types_text:
        issues.append(f"[SELF_IMPORT_IN_TYPES] {types_path.as_posix()}")

    if not THROW_ERROR_PATTERN.search(repo_text):
        warnings.append(f"[NO_THROW_ERROR_PATTERN] {repo_path.as_posix()}")

    if not SERVICE_FUNC_PATTERN.search(service_text):
        warnings.append(f"[NO_EXECUTE_FUNCTION_PATTERN] {service_path.as_posix()}")

    ok.append(f"[OK] {rel}")


def audit_domain_dir(domain_dir: Path) -> None:
    rel = domain_dir.as_posix()
    children = list(domain_dir.iterdir())

    loose_files = [p for p in children if p.is_file() and p.name not in ALLOWED_DOMAIN_LOOSE_FILES]
    if loose_files:
        issues.append(
            f"[LOOSE_FILES_IN_DOMAIN] {rel}: arquivos soltos {[p.name for p in loose_files]}"
        )

    subdirs = [p for p in children if p.is_dir()]
    if not subdirs and not any(p.name == ".gitkeep" for p in children):
        warnings.append(f"[EMPTY_DOMAIN_WITHOUT_GITKEEP] {rel}")

    for subdir in subdirs:
        if is_feature_dir(subdir):
            audit_feature_dir(subdir)
        else:
            nested_feature_dirs = [p for p in subdir.rglob("*") if is_feature_dir(p)]
            if nested_feature_dirs:
                for feat in nested_feature_dirs:
                    audit_feature_dir(feat)
            else:
                warnings.append(f"[NON_FEATURE_SUBDIR] {subdir.as_posix()}")


def find_supabase_outside_repositories(root: Path) -> None:
    for path in root.rglob("*.ts"):
        text = read_text(path)
        if not SUPABASE_PATTERN.search(text):
            continue
        if path.name != "repository.ts":
            issues.append(f"[SUPABASE_OUTSIDE_REPOSITORY] {path.as_posix()}")


def find_execute_outside_services(root: Path) -> None:
    for path in root.rglob("*.ts"):
        text = read_text(path)
        if SERVICE_FUNC_PATTERN.search(text) and path.name != "service.ts":
            issues.append(f"[EXECUTE_FUNCTION_OUTSIDE_SERVICE] {path.as_posix()}")


def main() -> None:
    if not ROOT.exists():
        print(f"Diretório não encontrado: {ROOT}")
        raise SystemExit(1)

    domains = list_domain_dirs(ROOT)
    for domain in domains:
        audit_domain_dir(domain)

    find_supabase_outside_repositories(ROOT)
    find_execute_outside_services(ROOT)

    print("\n=== AUDITORIA DE ARQUITETURA ===\n")

    print(f"Features/domínios verificados: {len(domains)}\n")

    if issues:
        print("ERROS:")
        for item in sorted(set(issues)):
            print(f"- {item}")
    else:
        print("ERROS:")
        print("- nenhum")

    print()

    if warnings:
        print("ALERTAS:")
        for item in sorted(set(warnings)):
            print(f"- {item}")
    else:
        print("ALERTAS:")
        print("- nenhum")

    print()

    print("FEATURES OK:")
    for item in sorted(set(ok)):
        print(f"- {item}")

    print("\n=== FIM ===")


if __name__ == "__main__":
    main()

