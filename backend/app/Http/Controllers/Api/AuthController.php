<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user (Guest or Member).
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email|max:100',
            'password' => 'required|string|min:6',
            'role' => 'nullable|in:mahasiswa,member,admin',
        ]);

        $role = $validated['role'] ?? 'mahasiswa';
        $quota = $role === 'admin' ? 999 : 5;

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $role,
            'booking_quota' => $quota,
        ]);

        $token = $user->createToken('kumpulin_auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi akun civitas kampus berhasil! Selamat datang di Kumpul-In.',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ], 201);
    }

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
                'message' => 'Email atau password yang Anda masukkan salah.',
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
     * Quick login helper for demo purposes (Guest, Member, or Admin).
     */
    public function quickLogin(Request $request)
    {
        $role = $request->input('role', 'mahasiswa');
        if ($role === 'admin') {
            $user = User::where('role', 'admin')->first();
        } else {
            $user = User::where('role', 'mahasiswa')->first() 
                ?? User::where('role', 'member')->first()
                ?? User::where('role', '!=', 'admin')->first();
        }

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
            'message' => "Login sebagai {$user->name} ({$user->role}) berhasil.",
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

    /**
     * Logout and revoke current token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }
}
