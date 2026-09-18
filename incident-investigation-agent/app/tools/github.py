from __future__ import annotations

from datetime import datetime
from typing import Any

import httpx

from app.config import Settings, get_settings
from app.schemas.evidence import SourceResult
from app.tools.results import errored, ok, unavailable


class GitHubClient:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self.token = self.settings.github_token
        self.repository = self.settings.github_repository
        self.timeout = self.settings.github_timeout

    def configured(self) -> bool:
        return bool(self.token and self.repository and "/" in self.repository)

    def _headers(self) -> dict[str, str]:
        return {
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {self.token}",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "incident-investigation-agent",
        }

    async def _get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        url = f"https://api.github.com{path}"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(url, headers=self._headers(), params=params)
            response.raise_for_status()
            return response.json()

    async def get_commits(
        self,
        since: datetime | None = None,
        until: datetime | None = None,
        path: str | None = None,
    ) -> SourceResult:
        if not self.configured():
            return unavailable("github", "GITHUB_TOKEN or GITHUB_REPOSITORY is not configured")
        params: dict[str, Any] = {"per_page": 30}
        if since:
            params["since"] = since.isoformat()
        if until:
            params["until"] = until.isoformat()
        if path:
            params["path"] = path
        try:
            payload = await self._get(f"/repos/{self.repository}/commits", params)
            commits = [
                {
                    "sha": item.get("sha"),
                    "message": (item.get("commit") or {}).get("message"),
                    "author": ((item.get("commit") or {}).get("author") or {}).get("name"),
                    "timestamp": ((item.get("commit") or {}).get("author") or {}).get("date"),
                    "url": item.get("html_url"),
                    "files": [f.get("filename") for f in item.get("files") or []],
                }
                for item in payload
            ]
            return ok("github", {"commits": commits, "repository": self.repository})
        except Exception as exc:
            return errored("github", exc)

    async def get_pull_requests(self) -> SourceResult:
        if not self.configured():
            return unavailable("github", "GITHUB_TOKEN or GITHUB_REPOSITORY is not configured")
        try:
            payload = await self._get(
                f"/repos/{self.repository}/pulls",
                {"state": "all", "sort": "updated", "direction": "desc", "per_page": 20},
            )
            pulls = [
                {
                    "number": item.get("number"),
                    "title": item.get("title"),
                    "merged_at": item.get("merged_at"),
                    "updated_at": item.get("updated_at"),
                    "user": (item.get("user") or {}).get("login"),
                    "head_sha": (item.get("head") or {}).get("sha"),
                }
                for item in payload
            ]
            return ok("github", {"pull_requests": pulls, "repository": self.repository})
        except Exception as exc:
            return errored("github", exc)

    async def get_deployments(self) -> SourceResult:
        if not self.configured():
            return unavailable("github", "GITHUB_TOKEN or GITHUB_REPOSITORY is not configured")
        try:
            payload = await self._get(
                f"/repos/{self.repository}/deployments",
                {"per_page": 20},
            )
            deployments = [
                {
                    "id": item.get("id"),
                    "sha": item.get("sha"),
                    "ref": item.get("ref"),
                    "environment": item.get("environment"),
                    "description": item.get("description"),
                    "created_at": item.get("created_at"),
                    "updated_at": item.get("updated_at"),
                    "creator": (item.get("creator") or {}).get("login"),
                }
                for item in payload
            ]
            return ok("github", {"deployments": deployments, "repository": self.repository})
        except Exception as exc:
            return errored("github", exc)

    async def collect(self, since: datetime | None = None, until: datetime | None = None) -> SourceResult:
        if not self.configured():
            return unavailable("github", "GITHUB_TOKEN or GITHUB_REPOSITORY is not configured")
        commits = await self.get_commits(since=since, until=until)
        deployments = await self.get_deployments()
        pulls = await self.get_pull_requests()
        if commits.status != "ok" and deployments.status != "ok" and pulls.status != "ok":
            return commits if commits.status != "ok" else deployments
        data: dict[str, Any] = {"repository": self.repository}
        if commits.status == "ok":
            data.update(commits.data or {})
        else:
            data["commits_error"] = commits.error
        if deployments.status == "ok":
            data.update(deployments.data or {})
        else:
            data["deployments_error"] = deployments.error
        if pulls.status == "ok":
            data.update(pulls.data or {})
        else:
            data["pull_requests_error"] = pulls.error
        return ok("github", data)


async def get_github_commits(since: datetime | None = None, until: datetime | None = None) -> SourceResult:
    return await GitHubClient().get_commits(since=since, until=until)


async def get_github_deployments() -> SourceResult:
    return await GitHubClient().get_deployments()
