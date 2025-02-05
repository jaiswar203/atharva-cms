import { DeviceFrameset } from 'react-device-frameset'
import 'react-device-frameset/styles/marvel-devices.min.css'

interface MobilePreviewProps {
    children: React.ReactNode
    className?: string
    device?: 'iPhone X'
    color?: string
    landscape?: boolean
}

export const MobilePreview = ({ children, className, device = 'iPhone X', color = 'gold', landscape = false }: MobilePreviewProps) => {
    return (
        <DeviceFrameset device={device} color={color} landscape={landscape}>
            {children}
        </DeviceFrameset>
    )

}