import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Введите логин'),
  password: z.string().min(6, 'Минимум 6 символов'),
});

export const registerSchema = z.object({
  fullName: z.string().min(1, 'Введите ФИО'),
  username: z
    .string()
    .min(3, 'Логин должен быть не короче 3 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Логин может содержать только латинские буквы, цифры и знак подчёркивания'),
  phone: z.string().min(1, 'Введите номер телефона'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
});