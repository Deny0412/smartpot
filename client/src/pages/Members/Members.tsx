import { UserCirclePlus } from 'phosphor-react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import GradientDiv from '../../components/GradientDiv/GradientDiv'
import Loader from '../../components/Loader/Loader'
import { H3 } from '../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../i18n'
import { loadHouseholds } from '../../redux/slices/householdsSlice'
import { fetchUsers } from '../../redux/slices/usersSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import InviteMember from './InviteMember/InviteMember'
import './Members.sass'

const Members: React.FC = () => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const { householdId } = useParams<{ householdId: string }>()
    const { households, loading: householdsLoading } = useSelector((state: RootState) => state.households)
    const { users, loading: usersLoading } = useSelector((state: RootState) => state.users)
    const { user } = useSelector((state: RootState) => state.auth)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

    const household = households.find(h => h.id === householdId)
    const isOwner = household?.owner === user?.id

    useEffect(() => {
        dispatch(loadHouseholds())
    }, [dispatch])

    useEffect(() => {
        if (household?.id) {
            dispatch(fetchUsers(household.id))
        }
    }, [dispatch, household])

    useEffect(() => {
        if (household && !isOwner && !householdsLoading) {
            navigate('/households')
        }
    }, [household, isOwner, householdsLoading, navigate])

    const handleRemoveMember = (memberId: string) => {
        // TODO: Implement remove member functionality
        console.log('Remove member:', memberId)
    }

    const handleMakeOwner = (memberId: string) => {
        // TODO: Implement make owner functionality
        console.log('Make owner:', memberId)
    }

    const getMemberName = (memberId: string) => {
        if (householdsLoading || usersLoading) return 'Načítavam...'
        const user = users[memberId]
        return user ? `${user.name} ${user.surname}` : 'Neznámy používateľ'
    }

    const getMemberRole = (memberId: string) => {
        if (householdsLoading || usersLoading) return 'Načítavam...'
        const user = users[memberId]
        return user?.role === 'owner' ? 'Vlastník' : 'Člen'
    }

    if (householdsLoading) {
        return <Loader />
    }

    if (!household) {
        return <div>Domácnosť sa nenašla</div>
    }

    if (!isOwner) {
        return <div>Nemáte oprávnenie na správu tejto domácnosti</div>
    }

    return (
        <div className="manage-members-container">
            <H3 variant="secondary" className="manage-members-title">
                {t('manage_household.manage_members.title')} {household.name}
            </H3>

            <GradientDiv className="manage-members-content">
                <div className="members-section">
                    <div className="section-content">
                        <div className="members-list">
                            {household.members.map(memberId => (
                                <div key={memberId} className="member-item">
                                    <div className="member-info">
                                        <span className="member-name">{getMemberName(memberId)}</span>
                                        <span
                                            className={users[memberId]?.role === 'owner' ? 'owner-tag' : 'member-tag'}>
                                            {t(
                                                `manage_household.manage_members.roles.${
                                                    users[memberId]?.role || 'member'
                                                }`,
                                            )}
                                        </span>
                                    </div>
                                    {memberId !== household.owner && (
                                        <div className="member-actions">
                                            <Button
                                                variant="default"
                                                className="make-owner-button"
                                                onClick={() => handleMakeOwner(memberId)}>
                                                {t('manage_household.manage_members.actions.make_owner')}
                                            </Button>
                                            <Button
                                                variant="default"
                                                className="remove-button"
                                                onClick={() => handleRemoveMember(memberId)}>
                                                {t('manage_household.manage_members.actions.remove')}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="add-member-icon" onClick={() => setIsInviteModalOpen(true)}>
                            <UserCirclePlus size={32} color="#bfbfbf" />
                        </div>
                    </div>
                </div>
            </GradientDiv>

            <InviteMember
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                householdId={householdId || ''}
            />
        </div>
    )
}

export default Members
