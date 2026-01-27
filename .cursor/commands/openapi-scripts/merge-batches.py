#!/usr/bin/env python3
"""
OpenAPI Batch Merger
Merges multiple batch OpenAPI files into a single complete schema.
"""

import json
import sys
import glob
from pathlib import Path
from typing import Dict, Any, List

def merge_openapi_batches(
    base_file: str,
    batch_pattern: str,
    output_file: str,
    api_name: str
) -> None:
    """
    Merge all batch OpenAPI files into final schema.

    Args:
        base_file: Path to base OpenAPI structure
        batch_pattern: Glob pattern for batch files (e.g., "batch-*.json")
        output_file: Path for merged output
        api_name: API name for description generation
    """
    print("🔀 Starting OpenAPI batch merge...")

    # Load base structure
    print(f"📖 Loading base: {base_file}")
    with open(base_file, 'r', encoding='utf-8') as f:
        merged = json.load(f)

    # Find all batch files
    batch_files = sorted(glob.glob(batch_pattern))
    print(f"📦 Found {len(batch_files)} batch files")

    if not batch_files:
        print("⚠️  No batch files found!")
        sys.exit(1)

    # Initialize counters
    total_paths = 0
    total_schemas = 0

    # Merge each batch
    for batch_file in batch_files:
        print(f"   Processing: {Path(batch_file).name}")

        with open(batch_file, 'r', encoding='utf-8') as f:
            batch = json.load(f)

        # Merge paths
        if 'paths' in batch:
            for path, methods in batch['paths'].items():
                if path not in merged['paths']:
                    merged['paths'][path] = {}

                # Merge each HTTP method
                for method, definition in methods.items():
                    merged['paths'][path][method] = definition
                    total_paths += 1

        # Merge components
        if 'components' in batch:
            # Merge schemas
            if 'schemas' in batch['components']:
                if 'schemas' not in merged['components']:
                    merged['components']['schemas'] = {}

                for schema_name, schema_def in batch['components']['schemas'].items():
                    merged['components']['schemas'][schema_name] = schema_def
                    total_schemas += 1

            # Merge parameters
            if 'parameters' in batch['components']:
                if 'parameters' not in merged['components']:
                    merged['components']['parameters'] = {}

                for param_name, param_def in batch['components']['parameters'].items():
                    merged['components']['parameters'][param_name] = param_def

            # Merge responses
            if 'responses' in batch['components']:
                if 'responses' not in merged['components']:
                    merged['components']['responses'] = {}

                for resp_name, resp_def in batch['components']['responses'].items():
                    merged['components']['responses'][resp_name] = resp_def

        # Merge tags
        if 'tags' in batch:
            existing_tag_names = {tag['name'] for tag in merged.get('tags', [])}
            for tag in batch['tags']:
                if tag['name'] not in existing_tag_names:
                    if 'tags' not in merged:
                        merged['tags'] = []
                    merged['tags'].append(tag)
                    existing_tag_names.add(tag['name'])

    # Generate index for info.description
    print("📋 Generating endpoint index...")
    merged['info']['description'] = generate_description_with_index(merged, api_name)

    # Write merged file
    print(f"💾 Writing merged schema: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)

    # Report
    print(f"\n✅ Merge complete!")
    print(f"   Total paths: {total_paths}")
    print(f"   Total schemas: {total_schemas}")
    print(f"   Total tags: {len(merged.get('tags', []))}")
    print(f"   Output: {output_file}")

def generate_description_with_index(schema: Dict[str, Any], api_name: str) -> str:
    """Generate info.description with endpoint index."""

    # Extract existing overview if available
    overview = schema['info'].get('description', '').split('## Index')[0].strip()
    if not overview:
        overview = f"API for {api_name}"

    # Group endpoints by tag
    endpoints_by_tag: Dict[str, List[Dict]] = {}

    for path, methods in schema['paths'].items():
        for method, definition in methods.items():
            # Get endpoint info
            summary = definition.get('summary', 'No summary')
            tags = definition.get('tags', ['General'])
            primary_tag = tags[0] if tags else 'General'

            # Transform path for URL
            url_path = path.replace('{', '-').replace('}', '-')

            # Build endpoint entry
            endpoint = {
                'method': method.upper(),
                'summary': summary,
                'url': f"https://developers.vtex.com/docs/api-reference/{api_name}-api#/{method.lower()}-{url_path}"
            }

            if primary_tag not in endpoints_by_tag:
                endpoints_by_tag[primary_tag] = []
            endpoints_by_tag[primary_tag].append(endpoint)

    # Build markdown index
    index_md = f"{overview}\r\n\r\n## Index\r\n"

    for tag, endpoints in sorted(endpoints_by_tag.items()):
        index_md += f"\r\n### {tag}\r\n"
        for ep in endpoints:
            index_md += f"\r\n- `{ep['method']}` [{ep['summary']}]({ep['url']})"

    return index_md

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python merge-openapi-batches.py <base_file> <batch_pattern> <output_file> <api_name>")
        print("Example: python merge-openapi-batches.py base.json 'batch-*.json' output.json orders")
        sys.exit(1)

    merge_openapi_batches(
        base_file=sys.argv[1],
        batch_pattern=sys.argv[2],
        output_file=sys.argv[3],
        api_name=sys.argv[4]
    )