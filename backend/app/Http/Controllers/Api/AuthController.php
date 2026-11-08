<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Login with email and password, issuing a Sanctum token.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah.',
            ], 401);
        }

        $token = $user->createToken('kumpulin_auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    /**
     * Quick login helper for demo purposes (Guest or Member).
     */
    public function quickLogin(Request $request)
    {
        $role = $request->input('role', 'guest');
        if (!in_array($role, ['guest', 'member'])) {
            $role = 'guest';
        }

        $user = User::where('role', $role)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => "Pengguna role {$role} tidak ditemukan.",
            ], 404);
        }

        // Revoke previous tokens for clean demo session
        $user->tokens()->delete();
        $token = $user->createToken('kumpulin_auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => "Login sebagai {$user->name} berhasil.",
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    /**
     * Get authenticated user profile.
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
        ]);
    }
}
