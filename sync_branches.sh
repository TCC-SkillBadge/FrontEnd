#!/bin/bash

git fetch --all


for branch in $(git branch -r | grep -v '\->'); do
    local_branch=${branch#origin/} 
    
    # Verifica se a branch local já existe
    if ! git rev-parse --verify "$local_branch" >/dev/null 2>&1; then
        echo "Criando branch local para $branch..."
        git checkout -b "$local_branch" "$branch"
    else
        echo "Branch local $local_branch já existe. Pulando..."
    fi
done

git checkout -
