# -*- coding: utf-8 -*-
"""clever の利用者を発行する（Identity Platform のテナント + Firestore の許可リスト）。

使い方:
  python3 scripts/add_users.py            # 対象と現状を表示するだけ（書き込まない）
  python3 scripts/add_users.py --apply    # 確認の表示のあと、書き込む

- パスワードは設定しない。各自がログイン画面の「初めての方はこちら」から自分で決める。
- 何度実行しても安全（既にあるユーザー・許可リストはスキップ／上書きしない）。
"""
import json
import sys
import urllib.parse
import urllib.request
import urllib.error

import google.auth.transport.requests
from google.oauth2 import service_account

PROJECT = "cyreco-management-dashboard"
TENANT = "clever-c8e59"
KEY = "/Users/yuta/.config/gcloud/cyreco-claude-code-sa-key.json"
SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]

USERS = [
    ("長谷", "nagaya.clv@gmail.com"),
    ("小泉", "koizumi.clv@gmail.com"),
    ("社長", "yan72cha@gmail.com"),
    ("松原", "matsubara.clv@gmail.com"),
    ("岡田", "okada.clv@gmail.com"),
]

IDP = f"https://identitytoolkit.googleapis.com/v1/projects/{PROJECT}/tenants/{TENANT}"
FS = f"https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/documents"


def token():
    creds = service_account.Credentials.from_service_account_file(KEY, scopes=SCOPES)
    creds.refresh(google.auth.transport.requests.Request())
    return creds.token


def call(method, url, tok, body=None):
    req = urllib.request.Request(
        url, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return 404, {}
        raise SystemExit(f"{method} {url} -> {e.code}: {e.read().decode()}")


def main():
    apply = "--apply" in sys.argv
    tok = token()
    plan = []
    for label, raw in USERS:
        email = raw.strip().lower()
        _, r = call("POST", f"{IDP}/accounts:lookup", tok, {"email": [email]})
        has_user = bool(r.get("users"))
        doc = f"{FS}/clever_allowed_users/{urllib.parse.quote(email, safe='')}"
        status, _ = call("GET", doc, tok)
        has_allow = status == 200
        plan.append((label, email, has_user, has_allow, doc))

    print(f"対象: project={PROJECT} tenant={TENANT}")
    for label, email, has_user, has_allow, _ in plan:
        print(f"  {label:<4} {email:<28} ユーザー:{'既存' if has_user else '新規'}  許可リスト:{'既存' if has_allow else '新規'}")

    if not apply:
        print("\n（確認のみ。書き込むには --apply を付けて再実行）")
        return

    if input("\n本番に書き込みます。よろしければ yes と入力: ").strip() != "yes":
        raise SystemExit("中止しました")

    for label, email, has_user, has_allow, doc in plan:
        if not has_user:
            call("POST", f"{IDP}/accounts", tok, {"email": email, "emailVerified": True})
            print(f"  ユーザー作成: {email}")
        if not has_allow:
            call("PATCH", doc, tok, {"fields": {"name": {"stringValue": label}}})
            print(f"  許可リスト登録: {email}")

    print("\n検証:")
    for label, email, *_ in plan:
        _, r = call("POST", f"{IDP}/accounts:lookup", tok, {"email": [email]})
        u = (r.get("users") or [{}])[0]
        s, _ = call("GET", f"{FS}/clever_allowed_users/{urllib.parse.quote(email, safe='')}", tok)
        print(f"  {email:<28} ユーザー:{'OK' if u else 'NG'} メール確認済み:{u.get('emailVerified')} 許可リスト:{'OK' if s == 200 else 'NG'}")


main()
