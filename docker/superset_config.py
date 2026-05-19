# Generate your own secret key for encryption. Use `openssl rand -base64 42` to generate a good key
SECRET_KEY = 'ThisIsASecretKeyNeedToChange0n!yDevUs4ge'

PREVENT_UNSAFE_DB_CONNECTIONS = False

FEATURE_FLAGS = {
    "DYNAMIC_PLUGINS": True,
}

# Blueprint: expose /dynamic-plugins/api/read as JSON API
# Superset 6.x DynamicPluginsView is a FAB ModelView (HTML only).
# The frontend expects GET /dynamic-plugins/api/read -> JSON.
from flask import Blueprint, jsonify

_dp_api = Blueprint("dynamic_plugins_api", __name__)


@_dp_api.route("/dynamic-plugins/api/read")
def _dp_api_read():
    import time
    from superset.extensions import db
    from superset.models.dynamic_plugins import DynamicPlugin

    plugins = db.session.query(DynamicPlugin).all()
    ts = int(time.time())
    return jsonify(
        {
            "result": [
                {
                    "id": p.id,
                    "name": p.name,
                    "key": p.key,
                    "bundle_url": p.bundle_url + f"?v={ts}",
                }
                for p in plugins
            ]
        }
    )


BLUEPRINTS = [_dp_api]

COMPRESS_REGISTER = False
COMPRESS_ENABLED = False
SESSION_COOKIE_SAMESITE = None
SESSION_COOKIE_SECURE = False
SESSION_COOKIE_HTTPONLY = False
WTF_CSRF_ENABLED = False
TALISMAN_ENABLED = False
TALISMAN_CONFIG = {
  "content_security_policy": {
  "base-uri": ["'self'"],
  "default-src": ["'self'"],
  "img-src": [
    "'self'",
    "blob:",
    "data:",
    "https://apachesuperset.gateway.scarf.sh",
    "https://static.scarf.sh/",
    # "https://cdn.brandfolder.io", # Uncomment when SLACK_ENABLE_AVATARS is True  # noqa: E501
    "ows.terrestris.de",
    "aws.s3.com", # Add Your Bucket or external data source
  ],
  "worker-src": ["'self'", "blob:"],
  "connect-src": [
    "'self'",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://cdn.jsdelivr.net"
  ],
  "object-src": "'none'",
  "style-src": [
    "'self'",
    "'unsafe-inline'",
  ],
  "script-src": ["'self'", "'strict-dynamic'"],
  },
  "content_security_policy_nonce_in": ["script-src"],
  "force_https": False,
  "session_cookie_secure": False,
  }