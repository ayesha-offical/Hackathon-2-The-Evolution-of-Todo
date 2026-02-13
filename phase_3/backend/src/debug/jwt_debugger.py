"""
JWT Debugger - Optional utility for debugging JWT verification issues.

This module provides debugging utilities to understand JWT token flow,
decoding, and user_id extraction in the middleware.

Usage:
    1. Add to backend for local debugging only
    2. Import: from src.debug.jwt_debugger import debug_jwt_token
    3. Call: debug_jwt_token(token, secret)
    4. Get detailed output about token contents
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict

from jose import jwt, JWTError

logger = logging.getLogger(__name__)


def debug_jwt_token(token: str, secret: str, algorithm: str = "HS256") -> Dict[str, Any]:
    """
    Debug JWT token: decode, verify, and display all claims.

    Args:
        token: JWT token string
        secret: Secret used to verify signature
        algorithm: JWT algorithm (default: HS256)

    Returns:
        Dict with token info, claims, and verification status

    Example:
        >>> token = "eyJhbGc..."
        >>> result = debug_jwt_token(token, "your-secret")
        >>> print(json.dumps(result, indent=2, default=str))
    """
    result = {
        "status": "success",
        "token_parts": None,
        "header": None,
        "payload": None,
        "verification": None,
        "claims": None,
        "user_id_claim": None,
        "expiration_status": None,
        "errors": [],
    }

    # Step 1: Split token into parts
    try:
        parts = token.split(".")
        if len(parts) != 3:
            result["status"] = "error"
            result["errors"].append(f"Invalid token format: expected 3 parts, got {len(parts)}")
            return result

        result["token_parts"] = {
            "header": parts[0][:20] + "...",
            "payload": parts[1][:20] + "...",
            "signature": parts[2][:20] + "...",
        }
    except Exception as e:
        result["status"] = "error"
        result["errors"].append(f"Failed to split token: {str(e)}")
        return result

    # Step 2: Verify signature and decode
    try:
        payload = jwt.decode(token, secret, algorithms=[algorithm])
        result["verification"] = {
            "algorithm_used": algorithm,
            "secret_used": secret[:10] + "..." if len(secret) > 10 else secret,
            "signature_valid": True,
        }
        result["payload"] = payload
        result["claims"] = list(payload.keys())
    except JWTError as e:
        result["status"] = "error"
        result["verification"] = {
            "algorithm_used": algorithm,
            "secret_used": secret[:10] + "..." if len(secret) > 10 else secret,
            "signature_valid": False,
            "error": str(e),
        }
        result["errors"].append(f"JWT verification failed: {str(e)}")
        return result
    except Exception as e:
        result["status"] = "error"
        result["errors"].append(f"Unexpected error during decode: {str(e)}")
        return result

    # Step 3: Extract user_id from 'sub' claim
    if "sub" in payload:
        result["user_id_claim"] = {
            "claim_name": "sub",
            "user_id": payload["sub"],
            "found": True,
        }
    else:
        result["user_id_claim"] = {
            "claim_name": "sub",
            "found": False,
            "available_claims": result["claims"],
        }

    # Step 4: Check expiration
    if "exp" in payload:
        exp_timestamp = payload["exp"]
        exp_datetime = datetime.fromtimestamp(exp_timestamp)
        is_expired = datetime.now() > exp_datetime

        result["expiration_status"] = {
            "exp_timestamp": exp_timestamp,
            "exp_datetime": exp_datetime.isoformat(),
            "is_expired": is_expired,
            "time_remaining_seconds": max(0, exp_timestamp - datetime.now().timestamp()),
        }

    return result


def print_jwt_debug(token: str, secret: str, algorithm: str = "HS256") -> None:
    """
    Pretty-print JWT debug information.

    Args:
        token: JWT token string
        secret: Secret used to verify signature
        algorithm: JWT algorithm (default: HS256)
    """
    debug_info = debug_jwt_token(token, secret, algorithm)

    print("\n" + "=" * 70)
    print("JWT DEBUG INFORMATION")
    print("=" * 70 + "\n")

    # Status
    status_icon = "✅" if debug_info["status"] == "success" else "❌"
    print(f"{status_icon} Overall Status: {debug_info['status'].upper()}\n")

    # Token Parts
    if debug_info["token_parts"]:
        print("Token Structure:")
        print(f"  Header:    {debug_info['token_parts']['header']}")
        print(f"  Payload:   {debug_info['token_parts']['payload']}")
        print(f"  Signature: {debug_info['token_parts']['signature']}")
        print()

    # Verification
    if debug_info["verification"]:
        print("Signature Verification:")
        print(f"  Algorithm:       {debug_info['verification']['algorithm_used']}")
        print(f"  Secret:          {debug_info['verification']['secret_used']}")
        valid_icon = "✅" if debug_info["verification"]["signature_valid"] else "❌"
        print(f"  {valid_icon} Valid:          {debug_info['verification']['signature_valid']}")
        if "error" in debug_info["verification"]:
            print(f"  Error:           {debug_info['verification']['error']}")
        print()

    # Claims
    if debug_info["claims"]:
        print(f"Claims ({len(debug_info['claims'])} total):")
        if debug_info["payload"]:
            for claim_name, claim_value in debug_info["payload"].items():
                if isinstance(claim_value, (int, str)):
                    print(f"  {claim_name}: {claim_value}")
                else:
                    print(f"  {claim_name}: {json.dumps(claim_value)}")
        print()

    # User ID
    if debug_info["user_id_claim"]:
        if debug_info["user_id_claim"]["found"]:
            user_id = debug_info["user_id_claim"]["user_id"]
            print(f"✅ User ID ('sub' claim):")
            print(f"   {user_id}\n")
            print("   ↳ This will be stored in request.state.user_id")
        else:
            print(f"❌ User ID ('sub' claim) NOT FOUND")
            print(f"   Available claims: {debug_info['user_id_claim']['available_claims']}\n")
        print()

    # Expiration
    if debug_info["expiration_status"]:
        exp = debug_info["expiration_status"]
        expired_icon = "⚠️ " if exp["is_expired"] else "✅"
        print(f"Expiration Status:")
        print(f"  {expired_icon} Expired:            {exp['is_expired']}")
        print(f"  Exp Timestamp:      {exp['exp_timestamp']}")
        print(f"  Exp DateTime:       {exp['exp_datetime']}")
        print(f"  Time Remaining:     {exp['time_remaining_seconds']:.0f} seconds")
        print()

    # Errors
    if debug_info["errors"]:
        print("❌ Errors:")
        for error in debug_info["errors"]:
            print(f"   • {error}")
        print()

    print("=" * 70 + "\n")


# Example usage (for testing):
if __name__ == "__main__":
    # Example token (replace with actual token for testing)
    EXAMPLE_TOKEN = (
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
        ".eyJzdWIiOiJ0ZXN0LXVzZXItaWQtMTIzIiwiaWF0IjoxNjkyNjI0ODAwLCJleHAiOjE2OTI2Mjg0MDB9"
        ".TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ"
    )

    EXAMPLE_SECRET = "your-secret-key"

    print_jwt_debug(EXAMPLE_TOKEN, EXAMPLE_SECRET)
