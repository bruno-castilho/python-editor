# SSM Documents

This folder contains AWS Systems Manager (SSM) Run Command documents used to operate the production server remotely.

## deploy-python-editor.yaml

Deploys the latest version of the application on EC2 instances tagged `DeployTarget=python-editor`.

### What it does

1. Removes the previous deploy directory (`/opt/python-editor`) to start from a clean state.
2. Clones only the `deploy/` folder from the GitHub repository using a shallow + sparse checkout.
3. Fetches all environment variables from SSM Parameter Store at `/python-editor/production/` (with decryption) and writes them to a `.env` file with `chmod 600`.
4. Pulls the latest Docker images (`docker compose pull`).
5. Recreates the containers (`docker compose up -d --remove-orphans`).
6. Deletes the `.env` file immediately after the containers start.
7. Prunes unused images, stopped containers, unused networks, and build cache (`docker system prune -af`).

### Registering the document

From the AWS CLI, register the document once in the target region:

```bash
aws ssm create-document \
  --name "deploy-python-editor" \
  --document-type "Command" \
  --document-format YAML \
  --content file://deploy-python-editor.yaml
```

To update it after changes:

```bash
aws ssm update-document \
  --name "deploy-python-editor" \
  --document-version "\$LATEST" \
  --document-format YAML \
  --content file://deploy-python-editor.yaml
```

### Running the document manually

```bash
aws ssm send-command \
  --targets "Key=tag:DeployTarget,Values=python-editor" \
  --document-name "deploy-python-editor" \
  --comment "Manual deploy"
```

### EC2 instance requirements

- **SSM Agent** installed and running.
- **Docker** and **Docker Compose** installed.
- **IAM instance profile** with the following permissions:
  - `ssm:GetParametersByPath` on `arn:aws:ssm:<region>:<account>:parameter/python-editor/production/*`
  - `ssm:DescribeInstanceInformation`, `ssm:UpdateInstanceInformation`, `ssm:GetDocument`, and `ec2messages:*` (standard SSM Agent permissions).
- The tag `DeployTarget=python-editor` so the command can target the instance.

### SSM Parameter Store

All environment variables required by the application must exist as `SecureString` parameters under `/python-editor/production/<VARIABLE_NAME>`.

See [`deploy/README.md`](../../deploy/README.md#environment-variables) for the full list of expected variables.
