#!/usr/bin/env bash

set -euo pipefail
export GIT_NO_REPLACE_OBJECTS=1

expected="${1:-}"
if [[ ${#expected} -ne 40 ]]; then
  echo "COMMIT_SHA must be a full 40-character revision" >&2
  exit 1
fi
if [[ ! $expected =~ ^[0-9a-f]{40}$ ]]; then
  echo "COMMIT_SHA must be lowercase hexadecimal" >&2
  exit 1
fi

if ! actual=$(git rev-parse --verify HEAD 2>/dev/null); then
  echo "Git source metadata is required" >&2
  exit 1
fi
if [[ $actual != "$expected" ]]; then
  echo "Cloud Build source revision does not match COMMIT_SHA" >&2
  exit 1
fi

if ! replacement_refs=$(git replace -l); then
  echo "Unable to verify Git replacement objects" >&2
  exit 1
fi
if [[ -n $replacement_refs ]]; then
  echo "Git replacement objects are not permitted" >&2
  exit 1
fi

if ! head_tree=$(git rev-parse --verify "${actual}^{tree}" 2>/dev/null); then
  echo "Unable to resolve reviewed source tree" >&2
  exit 1
fi
if ! index_tree=$(git write-tree 2>/dev/null); then
  echo "Git source index must be complete" >&2
  exit 1
fi
if [[ $index_tree != "$head_tree" ]]; then
  echo "Git source index must match the reviewed commit" >&2
  exit 1
fi

if ! index_flags=$(git ls-files -v); then
  echo "Unable to verify Git source index flags" >&2
  exit 1
fi
if grep -Eq '^[a-zS] ' <<<"$index_flags"; then
  echo "Git source index flags must be canonical" >&2
  exit 1
fi

if ! untracked=$(git ls-files --others); then
  echo "Unable to verify additional build inputs" >&2
  exit 1
fi
if [[ -n $untracked ]]; then
  echo "Git source contains additional build inputs" >&2
  exit 1
fi

tree_listing=$(mktemp)
trap 'rm -f "$tree_listing"' EXIT HUP INT TERM

canonical_context=.vortik-reviewed-source
if [[ -e $canonical_context ]]; then
  echo "Canonical build context path must not pre-exist" >&2
  exit 1
fi
mkdir "$canonical_context"

if ! git ls-tree -rz --full-tree "$actual" >"$tree_listing"; then
  echo "Unable to enumerate reviewed source tree" >&2
  exit 1
fi

file_count=0
while IFS= read -r -d '' entry; do
  metadata=${entry%%$'\t'*}
  path=${entry#*$'\t'}
  mode=${metadata%% *}
  remainder=${metadata#* }
  type=${remainder%% *}
  object=${remainder##* }

  if [[ $type != blob ]]; then
    echo "Reviewed source tree contains an unsupported non-blob entry" >&2
    exit 1
  fi
  case "$mode" in
    100644 | 100755) ;;
    *)
      echo "Reviewed source tree contains an unsupported file mode" >&2
      exit 1
      ;;
  esac

  if [[ ! -f $path || -L $path ]]; then
    echo "Git source worktree file types must match the reviewed commit" >&2
    exit 1
  fi
  if ! worktree_object=$(git hash-object --no-filters -- "$path"); then
    echo "Unable to hash raw Git source worktree bytes" >&2
    exit 1
  fi
  if [[ $worktree_object != "$object" ]]; then
    echo "Git source raw worktree bytes must match the reviewed commit" >&2
    exit 1
  fi
  if [[ $mode == 100755 && ! -x $path ]] ||
    [[ $mode == 100644 && -x $path ]]; then
    echo "Git source worktree modes must match the reviewed commit" >&2
    exit 1
  fi

  destination="$canonical_context/$path"
  mkdir -p -- "${destination%/*}"
  if ! git cat-file blob "$object" >"$destination"; then
    echo "Unable to materialize a reviewed source blob" >&2
    exit 1
  fi
  if [[ $mode == 100755 ]]; then
    chmod 755 "$destination"
  else
    chmod 644 "$destination"
  fi
  file_count=$((file_count + 1))
done <"$tree_listing"

if [[ $file_count -eq 0 ]]; then
  echo "Reviewed source tree must contain files" >&2
  exit 1
fi
