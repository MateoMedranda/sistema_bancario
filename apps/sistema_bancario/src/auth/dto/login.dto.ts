import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'El usuario o correo (username) es obligatorio' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña (password) es obligatoria' })
  password!: string;
}
