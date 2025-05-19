#!/bin/bash
# Publish all packages that have a new version.

workspace_root="$(dirname "${0}")/.."
source "${workspace_root}/workspace.sh"

for pkg_name in "${workspace[@]}"; do
  echo "Package $pkg_name.."

  if ! cd "${workspace_root}/packages/$pkg_name" 1>/dev/null 2>/dev/null; then
    echo "Error: Package $pkg_name not found" 1>&2
    exit 1
  fi

  local_version=$(jq -r '.version' package.json)
  remote_version=$(yarn npm info "@poap-xyz/$pkg_name" --fields version --json 2>/dev/null | jq -r '.version')

  echo
  echo "Building package $pkg_name@$local_version.."
  if ! yarn build; then
    echo "Error: Failed to build $pkg_name@$local_version" 1>&2
    exit 1
  fi

  # Check if the package exists remotely or if the version has changed
  if [ -z "$remote_version" ] || [ "$local_version" != "$remote_version" ]; then
    if [ -z "$remote_version" ]; then
      echo "Package $pkg_name not found in registry. Deploying for the first time."
    else
      echo "Detected version change in $pkg_name: $remote_version -> $local_version"
    fi

    if ! yarn npm publish --access public; then
      echo "Error: Failed publish $pkg_name"
      exit 1
    fi
  else
    echo "No version change detected for $pkg_name"
  fi

  if ! cd - 1>/dev/null 2>/dev/null; then
    echo "Error: Unable to change back to original directory" 1>&2
    exit 1
  fi
done
